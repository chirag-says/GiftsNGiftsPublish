/**
 * Cart Controller - Enterprise Security Hardened
 * 
 * SECURITY FEATURES:
 * - MAX_CART_ITEMS limit to prevent Cart Bombing attacks
 * - Stock obfuscation in responses (no raw integers)
 * - Proper error handling with handleError utility
 * - Rate limiting friendly responses
 */
import Cart from "../model/cart.js";
import Product from "../model/addproduct.js";
import { handleError } from "../utils/errorHandler.js";

// SECURITY: Maximum items allowed in cart (prevents database abuse)
const MAX_CART_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 100;

/**
 * Obfuscate stock information
 * SECURITY: Prevents competitors/scrapers from knowing exact inventory
 * 
 * @param {number} stock - Raw stock number
 * @returns {Object} - Obfuscated stock info
 */
const obfuscateStock = (stock) => {
    if (stock <= 0) {
        return { availabilityStatus: "Out of Stock", lowStock: false, inStock: false };
    }
    if (stock <= 5) {
        return { availabilityStatus: "Only Few Left", lowStock: true, inStock: true };
    }
    if (stock <= 10) {
        return { availabilityStatus: "Limited Stock", lowStock: true, inStock: true };
    }
    return { availabilityStatus: "In Stock", lowStock: false, inStock: true };
};

/**
 * Format cart item for response
 * SECURITY: Obfuscates sensitive data like exact stock numbers
 */
const formatCartItem = (item) => {
    if (!item.productId) return null;

    const stockInfo = obfuscateStock(item.productId.stock);

    return {
        product: {
            _id: item.productId._id,
            title: item.productId.title,
            price: item.productId.price,
            oldprice: item.productId.oldprice,
            discount: item.productId.discount,
            brand: item.productId.brand,
            image: item.productId.images?.[0]?.url || "",
            sellerId: item.sellerId || item.productId.sellerId,
            // SECURITY: Obfuscated stock info instead of raw number
            ...stockInfo
        },
        quantity: item.quantity,
    };
};

/**
 * Add item to cart
 * 
 * SECURITY:
 * - Cart item limit enforced (MAX_CART_ITEMS)
 * - Quantity limit per item (MAX_QUANTITY_PER_ITEM)
 * - Stock validation before adding
 */
export const Addtocart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Validate quantity
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        if (qty > MAX_QUANTITY_PER_ITEM) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${MAX_QUANTITY_PER_ITEM} items per product allowed`
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // SECURITY: Check cart item limit
        const existingItem = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        if (!existingItem && cart.items.length >= MAX_CART_ITEMS) {
            return res.status(400).json({
                success: false,
                message: `Cart is full. Maximum ${MAX_CART_ITEMS} items allowed.`
            });
        }

        const newQuantity = existingItem
            ? existingItem.quantity + qty
            : qty;

        // Validate total quantity
        if (newQuantity > MAX_QUANTITY_PER_ITEM) {
            return res.status(400).json({
                success: false,
                message: `Cannot add more. Maximum ${MAX_QUANTITY_PER_ITEM} of this item allowed.`
            });
        }

        // Validate stock availability
        if (newQuantity > product.stock) {
            const stockInfo = obfuscateStock(product.stock);
            return res.status(400).json({
                success: false,
                message: `Cannot add ${qty} items. ${stockInfo.availabilityStatus}. You already have ${existingItem ? existingItem.quantity : 0} in cart.`
            });
        }

        if (existingItem) {
            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({
                productId: product._id,
                sellerId: product.sellerId,
                quantity: qty,
            });
        }

        await cart.save();
        await cart.populate("items.productId items.sellerId");

        const formatted = cart.items
            .map(formatCartItem)
            .filter(Boolean);

        res.json({ success: true, cart: formatted });
    } catch (err) {
        handleError(res, err, "Failed to add item to cart");
    }
};

/**
 * Get user's cart
 * SECURITY: Stock numbers are obfuscated in response
 */
export const GetCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart || cart.items.length === 0) {
            return res.json({ success: true, cart: [] });
        }

        const formatted = cart.items
            .map(formatCartItem)
            .filter(Boolean);

        res.json({
            success: true,
            cart: formatted,
            cartInfo: {
                itemCount: formatted.length,
                maxItems: MAX_CART_ITEMS
            }
        });
    } catch (err) {
        handleError(res, err, "Failed to fetch cart");
    }
};

/**
 * Delete item from cart
 */
export const DeleteFromCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const { productId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const updatedItems = cart.items.filter(
            (item) => item.productId.toString() !== productId
        );

        if (updatedItems.length === cart.items.length) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        cart.items = updatedItems;

        await cart.save();
        await cart.populate("items.productId");

        const formatted = cart.items
            .map(formatCartItem)
            .filter(Boolean);

        res.json({
            success: true,
            message: "Item removed from cart",
            cart: formatted
        });
    } catch (err) {
        handleError(res, err, "Failed to remove item from cart");
    }
};

/**
 * Update cart item quantity
 * SECURITY: Validates quantity limits
 */
export const ToggleCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        if (qty > MAX_QUANTITY_PER_ITEM) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${MAX_QUANTITY_PER_ITEM} items per product allowed`
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check stock availability
        if (qty > product.stock) {
            const stockInfo = obfuscateStock(product.stock);
            return res.status(400).json({
                success: false,
                message: `${stockInfo.availabilityStatus}. Cannot set quantity to ${qty}.`
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            (item) => item.productId.toString() === productId
        );
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        item.quantity = qty;

        await cart.save();
        await cart.populate("items.productId");

        const formatted = cart.items
            .map(formatCartItem)
            .filter(Boolean);

        res.status(200).json({
            success: true,
            cart: formatted
        });
    } catch (error) {
        handleError(res, error, "Failed to update cart");
    }
};

/**
 * Clear user's entire cart
 */
export const clearUserCart = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        await Cart.findOneAndDelete({ userId: userId });

        return res.status(200).json({
            success: true,
            message: "Cart cleared."
        });
    } catch (err) {
        handleError(res, err, "Failed to clear cart");
    }
};
