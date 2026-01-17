/**
 * Wishlist Controller
 * REFACTORED: Extracted from auth_controller.js for Single Responsibility Principle
 * Handles all wishlist-related operations
 */
import Wishlist from "../model/wishlist.js";
import Product from "../model/addproduct.js";

/**
 * Add product to wishlist
 */
export const AddToWishlist = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) wishlist = new Wishlist({ userId, products: [] });

        const alreadyInWishlist = wishlist.products.includes(productId);
        if (!alreadyInWishlist) {
            wishlist.products.push(productId);
        }

        await wishlist.save();
        await wishlist.populate("products");

        const formatted = wishlist.products.map((product) => ({
            _id: product._id,
            title: product.title,
            price: product.price,
            oldprice: product.oldprice,
            discount: product.discount,
            brand: product.brand,
            image: product.images[0]?.url || "",
        }));

        res.json({ wishlist: formatted });
    } catch (err) {
        console.error("Add to Wishlist Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get user's wishlist
 */
export const GetWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await Wishlist.findOne({ userId }).populate("products");

        if (!wishlist || wishlist.products.length === 0) {
            return res.json({ wishlist: [] });
        }

        const formatted = wishlist.products.map((product) => ({
            _id: product._id,
            title: product.title,
            price: product.price,
            oldprice: product.oldprice,
            discount: product.discount,
            brand: product.brand,
            image: product.images[0]?.url || "",
            sellerId: product.sellerId,
        }));

        res.json({ wishlist: formatted });
    } catch (err) {
        console.error("Get Wishlist Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Remove product from wishlist
 */
export const RemoveFromWishlist = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    try {
        const wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        const updatedProducts = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        if (updatedProducts.length === wishlist.products.length) {
            return res.status(404).json({ message: "Item not found in wishlist" });
        }

        wishlist.products = updatedProducts;

        await wishlist.save();
        await wishlist.populate("products");

        const formatted = wishlist.products.map((product) => ({
            product: {
                _id: product._id,
                title: product.title,
                price: product.price,
                oldprice: product.oldprice,
                discount: product.discount,
                brand: product.brand,
                image: product.images[0]?.url || "",
            },
        }));

        res.json({ message: "Item removed from wishlist", wishlist: formatted });
    } catch (err) {
        console.error("RemoveFromWishlist Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
