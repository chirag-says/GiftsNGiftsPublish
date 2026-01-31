/**
 * Product Quick View Modal
 * Elegant modal for quick product preview with B2B features
 * Features: Image gallery, contents, pricing tiers, customization options
 */
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HiX, HiShoppingCart, HiHeart, HiStar, HiCheck,
    HiPlus, HiMinus, HiArrowRight, HiDocumentText,
    HiClock, HiTruck, HiShieldCheck, HiSparkles
} from "react-icons/hi";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext";
import api from "../../utils/api";

function ProductQuickView({ product, occasion, onClose }) {
    const { isLoggedin, fetchCart } = useContext(AppContext);
    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [customization, setCustomization] = useState({
        logo: false,
        message: false,
        premiumPackaging: false,
        customMessage: ''
    });

    const images = product.images?.length > 0
        ? product.images
        : [{ url: 'https://via.placeholder.com/400' }];

    // Calculate price based on quantity
    const getUnitPrice = () => {
        if (!product.bulkPricing) return product.price;
        if (quantity >= 500) return product.bulkPricing.tier500;
        if (quantity >= 100) return product.bulkPricing.tier100;
        if (quantity >= 50) return product.bulkPricing.tier50;
        return product.price;
    };

    const unitPrice = getUnitPrice();
    const savings = (product.price - unitPrice) * quantity;
    const total = unitPrice * quantity +
        (customization.logo ? 50 * quantity : 0) +
        (customization.premiumPackaging ? 30 * quantity : 0);

    const handleAddToCart = async () => {
        if (!isLoggedin) {
            toast.warning("Please login to add to cart");
            navigate("/login");
            return;
        }

        setIsAddingToCart(true);
        try {
            await api.post("/api/auth/cart", {
                productId: product._id,
                quantity,
                customization
            });
            await fetchCart();
            toast.success("Added to cart!");
            onClose();
            navigate("/b2b-cart");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add to cart");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBulkQuote = () => {
        navigate(`/bulk-quote?product=${product._id}&occasion=${occasion?.slug || ''}`);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/90 text-slate-500 hover:bg-slate-100 hover:text-slate-800 shadow-lg transition"
                >
                    <HiX className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden">
                    {/* Left - Image Gallery */}
                    <div className="md:w-1/2 p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                        {/* Main Image */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner mb-4">
                            <img
                                src={images[selectedImage]?.url}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Badges */}
                            {product.discount > 0 && (
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold shadow-lg">
                                    {product.discount}% OFF
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${selectedImage === idx
                                            ? 'border-amber-500 shadow-lg'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right - Product Info */}
                    <div className="md:w-1/2 p-6 md:overflow-y-auto">
                        {/* Title & Rating */}
                        <div className="mb-4">
                            {product.state && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 text-teal-600 text-xs font-semibold mb-2">
                                    📍 {product.state}
                                </span>
                            )}
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                {product.title}
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <HiStar
                                            key={i}
                                            className={`w-5 h-5 ${i < (product.rating || 4) ? 'text-amber-400' : 'text-slate-200'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-slate-500">{product.rating || 4.8} ({product.reviewCount || 0} reviews)</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-3xl font-bold text-slate-900">₹{unitPrice?.toLocaleString()}</span>
                                {product.oldprice > product.price && (
                                    <span className="text-lg text-slate-400 line-through">₹{product.oldprice}</span>
                                )}
                                <span className="text-sm text-slate-500">per unit</span>
                            </div>
                            {product.bulkPricing && (
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-lg bg-white text-slate-600">
                                        50+: <span className="font-semibold text-amber-600">₹{product.bulkPricing.tier50}</span>
                                    </span>
                                    <span className="px-2 py-1 rounded-lg bg-white text-slate-600">
                                        100+: <span className="font-semibold text-amber-600">₹{product.bulkPricing.tier100}</span>
                                    </span>
                                    <span className="px-2 py-1 rounded-lg bg-white text-slate-600">
                                        500+: <span className="font-semibold text-amber-600">₹{product.bulkPricing.tier500}</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* What's Inside (for hampers) */}
                        {product.contents && product.contents.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <HiSparkles className="w-5 h-5 text-amber-500" />
                                    What's Inside
                                </h4>
                                <ul className="space-y-2">
                                    {product.contents.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-slate-600">
                                            <HiCheck className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Perfect For */}
                        {product.perfectFor && product.perfectFor.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-slate-800 mb-3">Perfect For</h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.perfectFor.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium">
                                            ✓ {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customization Options */}
                        {product.customizationAvailable && (
                            <div className="mb-6">
                                <h4 className="font-semibold text-slate-800 mb-3">Customization</h4>
                                <div className="space-y-2">
                                    {product.customizationAvailable.logo && (
                                        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300 transition">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={customization.logo}
                                                    onChange={(e) => setCustomization(prev => ({ ...prev, logo: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                                />
                                                <span className="text-slate-700">Add company logo</span>
                                            </div>
                                            <span className="text-sm text-slate-500">+₹50/unit</span>
                                        </label>
                                    )}
                                    {product.customizationAvailable.message && (
                                        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300 transition">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={customization.message}
                                                    onChange={(e) => setCustomization(prev => ({ ...prev, message: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                                />
                                                <span className="text-slate-700">Custom message card</span>
                                            </div>
                                            <span className="text-sm text-green-600">Free</span>
                                        </label>
                                    )}
                                    {product.customizationAvailable.packaging && (
                                        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300 transition">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={customization.premiumPackaging}
                                                    onChange={(e) => setCustomization(prev => ({ ...prev, premiumPackaging: e.target.checked }))}
                                                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                                />
                                                <span className="text-slate-700">Premium packaging</span>
                                            </div>
                                            <span className="text-sm text-slate-500">+₹30/unit</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-slate-800 mb-3">Quantity</h4>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:bg-slate-100 transition"
                                    >
                                        <HiMinus className="w-5 h-5 text-slate-600" />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 text-center border-0 text-lg font-semibold text-slate-800 focus:ring-0"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 hover:bg-slate-100 transition"
                                    >
                                        <HiPlus className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                                <span className="text-sm text-slate-500">units</span>
                            </div>
                            {savings > 0 && (
                                <p className="mt-2 text-sm text-green-600 font-medium">
                                    You save ₹{savings.toLocaleString()} with bulk pricing!
                                </p>
                            )}
                        </div>

                        {/* Delivery Info */}
                        <div className="mb-6 flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                                <HiTruck className="w-5 h-5 text-amber-500" />
                                <span>{product.deliveryDays || '5-7 days'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <HiClock className="w-5 h-5 text-green-500" />
                                <span>Express available</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-white">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Estimated Total</span>
                                <span className="text-2xl font-bold">₹{total.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Final price will be calculated at checkout
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 shadow-lg shadow-amber-500/30"
                                >
                                    <HiShoppingCart className="w-5 h-5" />
                                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>
                                <button className="p-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-500 transition">
                                    <HiHeart className="w-6 h-6" />
                                </button>
                            </div>

                            <button
                                onClick={handleBulkQuote}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-800 text-slate-800 font-semibold hover:bg-slate-800 hover:text-white transition"
                            >
                                <HiDocumentText className="w-5 h-5" />
                                Request Bulk Quote (100+)
                            </button>

                            <Link
                                to={`/products/${product._id}`}
                                onClick={onClose}
                                className="flex items-center justify-center gap-2 py-3 text-slate-600 hover:text-amber-600 font-medium transition"
                            >
                                View Full Details
                                <HiArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <HiShieldCheck className="w-4 h-4 text-green-500" />
                                    Secure Payment
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiCheck className="w-4 h-4 text-green-500" />
                                    Quality Assured
                                </span>
                                <span className="flex items-center gap-1">
                                    <HiTruck className="w-4 h-4 text-green-500" />
                                    Free Shipping 1000+
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default ProductQuickView;
