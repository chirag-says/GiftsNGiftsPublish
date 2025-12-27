/**
 * Cart Controller
 * REFACTORED: Extracted from auth_controller.js for Single Responsibility Principle
 * Handles all cart-related operations
 */
import Cart from "../model/cart.js";
import Product from "../model/addproduct.js";

/**
 * Add item to cart
 */
export const Addtocart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) cart = new Cart({ userId, items: [] });

        const existingItem = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        const newQuantity = existingItem
            ? existingItem.quantity + parseInt(quantity, 10)
            : parseInt(quantity, 10);

        if (newQuantity > product.stock) {
            return res.status(400).json({
                message: `Cannot add ${quantity} items. Only ${product.stock} in stock. You already have ${existingItem ? existingItem.quantity : 0} in cart.`
            });
        }

        if (existingItem) {
            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({
                productId: product._id,
                sellerId: product.sellerId,
                quantity: parseInt(quantity, 10),
            });
        }

        await cart.save();
        await cart.populate("items.productId items.sellerId");

        const formatted = cart.items
            .filter((item) => item.productId)
            .map((item) => ({
                product: {
                    _id: item.productId._id,
                    title: item.productId.title,
                    price: item.productId.price,
                    oldprice: item.productId.oldprice,
                    discount: item.productId.discount,
                    brand: item.productId.brand,
                    image: item.productId.images?.[0]?.url || "",
                    sellerId: item.sellerId,
                    stock: item.productId.stock
                },
                quantity: item.quantity,
            }));

        res.json({ cart: formatted });
    } catch (err) {
        console.error("Error in Addtocart:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get user's cart
 */
export const GetCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart || cart.items.length === 0) {
            return res.json({ cart: [] });
        }

        const formatted = cart.items
            .filter((item) => item.productId)
            .map((item) => ({
                product: {
                    _id: item.productId._id,
                    title: item.productId.title,
                    price: item.productId.price,
                    oldprice: item.productId.oldprice,
                    discount: item.productId.discount,
                    brand: item.productId.brand,
                    image: item.productId.images[0]?.url || "",
                    sellerId: item.productId.sellerId,
                    stock: item.productId.stock
                },
                quantity: item.quantity,
            }));

        res.json({ cart: formatted });
    } catch (err) {
        console.error("Get Cart Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Delete item from cart
 */
export const DeleteFromCart = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const updatedItems = cart.items.filter(
            (item) => item.productId.toString() !== productId
        );

        if (updatedItems.length === cart.items.length) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        cart.items = updatedItems;

        await cart.save();
        await cart.populate("items.productId");

        const formatted = cart.items
            .filter((item) => item.productId)
            .map((item) => ({
                product: {
                    _id: item.productId._id,
                    title: item.productId.title,
                    price: item.productId.price,
                    oldprice: item.productId.oldprice,
                    discount: item.productId.discount,
                    brand: item.productId.brand,
                    image: item.productId.images[0]?.url || "",
                    sellerId: item.productId.sellerId
                },
                quantity: item.quantity,
            }));

        res.json({ message: "Item removed from cart", cart: formatted });
    } catch (err) {
        console.error("DeleteFromCart Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Update cart item quantity
 */
export const ToggleCartQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        if (isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Check stock availability
        if (quantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find(
            (item) => item.productId.toString() === productId
        );
        if (!item) return res.status(404).json({ message: "Product not in cart" });

        item.quantity = quantity;

        await cart.save();
        await cart.populate("items.productId");

        res.status(200).json({
            cart: cart.items.map((item) => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.productId.price,
                sellerId: item.productId.sellerId
            })),
        });
    } catch (error) {
        console.error("Update Cart Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Clear user's entire cart
 */
export const clearUserCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await Cart.findOneAndDelete({ userId: userId });

        return res.status(200).json({ success: true, message: "Cart cleared." });
    } catch (err) {
        console.error("Error clearing cart:", err);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
