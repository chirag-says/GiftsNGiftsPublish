import addproductmodel from "../model/addproduct.js";
import Category from "../model/Category.js";
import orderModel from "../model/order.js";
import sellermodel from "../model/sellermodel.js";

export const productlist = async (req, res) => {
  try {
    // 1. Get IDs of active sellers (not on holiday, not suspended)
    const activeSellers = await sellermodel.find({ 
      holidayMode: { $ne: true },
      status: { $ne: 'Suspended' },
      isBlocked: { $ne: true }
    }).select('_id');
    
    const activeSellerIds = activeSellers.map(s => s._id);

    const categories = await Category.find();
    // 2. Filter products by active sellers OR no seller (Admin products)
    const products = await addproductmodel.find({
      $or: [
        { sellerId: { $in: activeSellerIds } },
        { sellerId: { $exists: false } },
        { sellerId: null }
      ]
    });

    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({ products, categories });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const getAllProductsByCategory = async (req, res) => {
  try {
    // Get active sellers
    const activeSellers = await sellermodel.find({ 
      holidayMode: { $ne: true },
      status: { $ne: 'Suspended' },
      isBlocked: { $ne: true }
    }).select('_id');
    const activeSellerIds = activeSellers.map(s => s._id);

    const categories = await Category.find();
    const result = await Promise.all(
      categories.map(async (category) => {
        const products = await addproductmodel.find({ 
          categoryname: category._id,
          $or: [
            { sellerId: { $in: activeSellerIds } },
            { sellerId: { $exists: false } },
            { sellerId: null }
          ]
        });
        return { category: category.categoryname, products };
      })
    );
    res.status(200).json({ success: true, categories: result });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const placeorder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, userId, image, paymentId } = req.body;

    if (!items?.length || !shippingAddress || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing order details." });
    }

    // 1. Validate Stock for all items first
    const productsToUpdate = [];
    for (const item of items) {
      const product = await addproductmodel.findById(item.productId).populate('sellerId');
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name || item.productId}` });
      }

      // Check Seller Status (Skip check if no seller - assume Admin/Legacy)
      const seller = product.sellerId;
      if (seller && (seller.holidayMode || seller.status === 'Suspended' || seller.isBlocked)) {
        return res.status(400).json({
          success: false,
          message: `Seller for "${product.title}" is currently unavailable.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`
        });
      }
      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // 2. Create the Order
    const newOrder = new orderModel({
      user: userId,
      items,
      totalAmount,
      shippingAddress,
      image,
      paymentId: paymentId || null
    });

    await newOrder.save();

    // 3. Deduct Stock (pre-save hook in model will handle isAvailable/status)
    for (const { product, quantity } of productsToUpdate) {
      product.stock -= quantity;
      await product.save();
    }

    res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to place order", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel
      .find({ user: userId })
      .populate("items.productId")
      .sort({ placedAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id).populate("items.productId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch order", error: error.message });
  }
};

export const getSearchProduct = async (req, res) => {
  try {
    // Get active sellers
    const activeSellers = await sellermodel.find({ 
      holidayMode: { $ne: true },
      status: { $ne: 'Suspended' },
      isBlocked: { $ne: true }
    }).select('_id');
    const activeSellerIds = activeSellers.map(s => s._id);

    const products = await addproductmodel.find({
      $or: [
        { sellerId: { $in: activeSellerIds } },
        { sellerId: { $exists: false } },
        { sellerId: null }
      ]
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const validateStock = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "No items to validate" });
    }

    for (const item of items) {
      const product = await addproductmodel.findById(item.productId).populate('sellerId');
      
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      // Check Seller Status (Skip check if no seller - assume Admin/Legacy)
      const seller = product.sellerId;
      if (seller && (seller.holidayMode || seller.status === 'Suspended' || seller.isBlocked)) {
        return res.status(400).json({
          success: false,
          message: `Seller for "${product.title}" is currently unavailable.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`
        });
      }
    }

    res.status(200).json({ success: true, message: "Stock available" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Validation failed", error: error.message });
  }
};