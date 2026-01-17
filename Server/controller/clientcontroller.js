/**
 * Client Controller
 * 
 * SECURITY HARDENED:
 * - IDOR Protection on all order operations
 * - NoSQL Injection prevention
 * - ReDoS-safe search
 * - Uses req.userId from auth middleware (never req.body.userId)
 */

import addproductmodel from "../model/addproduct.js";
import Category from "../model/Category.js";
import orderModel from "../model/order.js";
import sellermodel from "../model/sellermodel.js";
import {
  handleError,
  isValidObjectId,
  createSafeSearchRegex,
  sanitizeForMongo
} from "../utils/errorHandler.js";

/**
 * Get list of all available products
 * Excludes products from: holiday mode sellers, suspended sellers, blocked sellers
 */
export const productlist = async (req, res) => {
  try {
    // Get IDs of unavailable sellers
    const unavailableSellers = await sellermodel.find({
      $or: [
        { holidayMode: true },
        { status: 'Suspended' },
        { isBlocked: true }
      ]
    }).select('_id');

    const unavailableSellerIds = unavailableSellers.map(s => s._id);

    const categories = await Category.find();

    // Filter products: Exclude those from unavailable sellers
    const products = await addproductmodel.find({
      sellerId: { $nin: unavailableSellerIds }
    });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found"
      });
    }

    res.status(200).json({ success: true, products, categories });
  } catch (error) {
    handleError(res, error, "Failed to fetch products");
  }
};

/**
 * Get all products organized by category
 */
export const getAllProductsByCategory = async (req, res) => {
  try {
    // Get unavailable sellers
    const unavailableSellers = await sellermodel.find({
      $or: [
        { holidayMode: true },
        { status: 'Suspended' },
        { isBlocked: true }
      ]
    }).select('_id');
    const unavailableSellerIds = unavailableSellers.map(s => s._id);

    const categories = await Category.find();
    const result = await Promise.all(
      categories.map(async (category) => {
        const products = await addproductmodel.find({
          categoryname: category._id,
          sellerId: { $nin: unavailableSellerIds }
        });
        return { category: category.categoryname, products };
      })
    );

    res.status(200).json({ success: true, categories: result });
  } catch (error) {
    handleError(res, error, "Failed to fetch products by category");
  }
};

/**
 * Place Order
 * 
 * SECURITY:
 * - Uses req.userId from auth middleware (NOT req.body.userId)
 * - Validates stock availability
 * - Checks seller availability
 */
export const placeorder = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware, NOT from body
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { items, totalAmount, shippingAddress, image, paymentId } = req.body;

    // Validate required fields
    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: "Order items are required"
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required"
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required"
      });
    }

    // Validate stock for all items
    const productsToUpdate = [];
    for (const item of items) {
      // SECURITY: Validate productId format
      if (!isValidObjectId(item.productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID format`
        });
      }

      const product = await addproductmodel.findById(item.productId).populate('sellerId');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || 'Unknown'}`
        });
      }

      // Check seller status
      const seller = product.sellerId;
      if (seller && (seller.holidayMode || seller.status === 'Suspended' || seller.isBlocked)) {
        return res.status(400).json({
          success: false,
          message: `Seller for "${product.title}" is currently unavailable.`
        });
      }

      // Validate quantity
      const quantity = parseInt(item.quantity) || 0;
      if (quantity <= 0 || quantity > 100) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.title}`
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`
        });
      }

      productsToUpdate.push({ product, quantity });
    }

    // Create the order with authenticated userId
    const newOrder = new orderModel({
      user: userId, // SECURITY: From auth middleware
      items,
      totalAmount,
      shippingAddress,
      image,
      paymentId: paymentId || null
    });

    await newOrder.save();

    // Deduct stock
    for (const { product, quantity } of productsToUpdate) {
      product.stock -= quantity;
      await product.save();
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });
  } catch (error) {
    handleError(res, error, "Failed to place order");
  }
};

/**
 * Get User's Orders
 * 
 * SECURITY:
 * - Uses req.userId from auth middleware exclusively
 * - IDOR Protection: Users can only see their own orders
 */
export const getUserOrders = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId, NOT from body
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const orders = await orderModel
      .find({ user: userId }) // IDOR Protection
      .populate("items.productId")
      .sort({ placedAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    handleError(res, error, "Failed to fetch orders");
  }
};

/**
 * Get Single Order by ID
 * 
 * SECURITY (IDOR PROTECTION):
 * - Fetches order using BOTH _id AND user
 * - Users can ONLY access their own orders
 * - Validates ObjectId format before query
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY: Use authenticated userId
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // SECURITY: Validate ObjectId format to prevent injection
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format"
      });
    }

    // SECURITY: IDOR Protection - Query with BOTH id AND userId
    // This ensures users can ONLY access their own orders
    const order = await orderModel.findOne({
      _id: id,
      user: userId  // CRITICAL: Ownership check
    }).populate("items.productId");

    if (!order) {
      // Generic message prevents order enumeration
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    handleError(res, error, "Failed to fetch order");
  }
};

/**
 * Search Products
 * 
 * SECURITY:
 * - ReDoS Protection: Escapes regex special characters
 * - NoSQL Injection Prevention: Sanitizes query input
 * - Limits search term length
 */
export const getSearchProduct = async (req, res) => {
  try {
    const { q, query } = req.query;
    const searchTerm = q || query || '';

    // Get unavailable sellers
    const unavailableSellers = await sellermodel.find({
      $or: [
        { holidayMode: true },
        { status: 'Suspended' },
        { isBlocked: true }
      ]
    }).select('_id');
    const unavailableSellerIds = unavailableSellers.map(s => s._id);

    // Build base query
    const baseQuery = {
      sellerId: { $nin: unavailableSellerIds }
    };

    // If search term provided, create safe regex
    if (searchTerm && searchTerm.trim()) {
      // SECURITY: Create safe regex that escapes all special characters
      const safeRegex = createSafeSearchRegex(searchTerm);

      if (safeRegex) {
        baseQuery.$or = [
          { title: safeRegex },
          { description: safeRegex },
          { brand: safeRegex }
        ];
      }
    }

    const products = await addproductmodel.find(baseQuery).limit(100);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    handleError(res, error, "Search failed");
  }
};

/**
 * Validate Stock Availability
 * 
 * SECURITY:
 * - Uses req.userId for authentication verification
 * - Validates all productIds
 */
export const validateStock = async (req, res) => {
  try {
    // SECURITY: Require authentication
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({
        success: false,
        message: "No items to validate"
      });
    }

    // Limit items to prevent DoS
    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Too many items to validate"
      });
    }

    for (const item of items) {
      // SECURITY: Validate ObjectId format
      if (!isValidObjectId(item.productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format"
        });
      }

      const product = await addproductmodel.findById(item.productId).populate('sellerId');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name || 'Unknown'}`
        });
      }

      // Check seller status
      const seller = product.sellerId;
      if (seller && (seller.holidayMode || seller.status === 'Suspended' || seller.isBlocked)) {
        return res.status(400).json({
          success: false,
          message: `Seller for "${product.title}" is currently unavailable.`
        });
      }

      const quantity = parseInt(item.quantity) || 0;
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`
        });
      }
    }

    res.status(200).json({ success: true, message: "Stock available" });
  } catch (error) {
    handleError(res, error, "Stock validation failed");
  }
};