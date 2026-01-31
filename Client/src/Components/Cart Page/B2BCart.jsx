/**
 * B2B Corporate Cart Page
 * Enhanced cart for corporate gifting with bulk pricing, customization options
 */
import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiShoppingBag, HiTrash, HiPlus, HiMinus, HiArrowLeft,
    HiSparkles, HiLightningBolt, HiCheck, HiBadgeCheck,
    HiTag, HiPencil, HiPhotograph, HiGift, HiTruck,
    HiShieldCheck, HiClock, HiChatAlt
} from "react-icons/hi";

function B2BCart() {
    const navigate = useNavigate();
    const { cartItems, setCartItems, fetchCart } = useContext(AppContext);
    const [selectedItems, setSelectedItems] = useState([]);
    const [customization, setCustomization] = useState({
        addLogo: false,
        customMessage: "",
        premiumPackaging: true,
        giftWrap: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart().finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (cartItems.length > 0) {
            setSelectedItems(cartItems.map(item => item.product._id));
        }
    }, [cartItems]);

    const handleRemove = async (cartItemId) => {
        try {
            await api.delete(`/api/auth/delete/${cartItemId}`);
            setCartItems(prev => prev.filter(item => item.product._id !== cartItemId));
            toast.success("Item removed");
        } catch (err) {
            toast.error("Error removing item");
        }
    };

    const handleUpdateQuantity = async (productId, newQty) => {
        if (newQty < 1) return;
        try {
            await api.put('/api/auth/update-quantity', { productId, quantity: newQty });
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.product._id === productId ? { ...item, quantity: newQty } : item
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Error updating quantity");
        }
    };

    // Calculate totals with bulk discounts
    const orderSummary = useMemo(() => {
        const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.product._id));

        const itemsTotal = selectedCartItems.reduce((acc, item) => {
            return acc + ((item.product?.price || 0) * (item.quantity || 1));
        }, 0);

        const totalQty = selectedCartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

        // Bulk discount tiers
        let discountPercent = 0;
        let discountTier = "";
        if (totalQty >= 500) { discountPercent = 20; discountTier = "500+"; }
        else if (totalQty >= 100) { discountPercent = 15; discountTier = "100+"; }
        else if (totalQty >= 50) { discountPercent = 10; discountTier = "50+"; }
        else if (totalQty >= 25) { discountPercent = 5; discountTier = "25+"; }

        const bulkDiscount = (itemsTotal * discountPercent) / 100;

        // Customization costs
        const customizationCost =
            (customization.addLogo ? 50 * totalQty : 0) +
            (customization.premiumPackaging ? 30 * totalQty : 0) +
            (customization.giftWrap ? 20 * totalQty : 0);

        const subtotal = itemsTotal - bulkDiscount + customizationCost;
        const gst = subtotal * 0.18;
        const grandTotal = subtotal + gst;

        // Savings calculation
        const potentialSavings = {
            qty25: totalQty < 25 ? (25 - totalQty) : 0,
            savings25: totalQty < 25 ? Math.round((itemsTotal * 0.05)) : 0,
            qty50: totalQty >= 25 && totalQty < 50 ? (50 - totalQty) : 0,
            savings50: totalQty >= 25 && totalQty < 50 ? Math.round((itemsTotal * 0.05)) : 0,
        };

        return {
            itemsTotal,
            totalQty,
            discountPercent,
            discountTier,
            bulkDiscount,
            customizationCost,
            subtotal,
            gst,
            grandTotal,
            potentialSavings
        };
    }, [cartItems, selectedItems, customization]);

    const handleProceed = () => {
        if (selectedItems.length === 0) {
            toast.warning("Select items to proceed");
            return;
        }
        navigate('/b2b-checkout', {
            state: {
                selectedItems,
                customization,
                orderSummary
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-amber-50/20">
                <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-amber-50/20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-white rounded-3xl p-12 shadow-xl max-w-md"
                >
                    <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <HiShoppingBag className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Your cart is empty</h2>
                    <p className="text-slate-500 mb-8">Start shopping for premium Northeast gifts!</p>
                    <button
                        onClick={() => navigate('/shop-by-occasion')}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition shadow-lg"
                    >
                        Shop by Occasion
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/20 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition mb-4"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                        <span>Continue Shopping</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                            <HiShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Your Gift Cart</h1>
                            <p className="text-slate-500">{cartItems.length} items • {orderSummary.totalQty} units total</p>
                        </div>
                    </div>
                </div>

                {/* Bulk Discount Banner */}
                {orderSummary.discountPercent > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-4 mb-6 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <HiBadgeCheck className="w-8 h-8" />
                            <div>
                                <p className="font-bold">Bulk Discount Applied! 🎉</p>
                                <p className="text-sm text-emerald-100">
                                    {orderSummary.discountPercent}% off on {orderSummary.discountTier} units
                                </p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold">-₹{orderSummary.bulkDiscount.toLocaleString()}</span>
                    </motion.div>
                )}

                {/* Savings Nudge */}
                {orderSummary.potentialSavings.qty25 > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-4">
                        <HiLightningBolt className="w-6 h-6 text-amber-500" />
                        <div>
                            <p className="text-amber-800 font-medium">
                                Add {orderSummary.potentialSavings.qty25} more units to unlock 5% bulk discount!
                            </p>
                            <p className="text-sm text-amber-600">
                                You could save ₹{orderSummary.potentialSavings.savings25.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left - Cart Items */}
                    <div className="lg:w-2/3 space-y-4">
                        {/* Cart Items List */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item.product._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 md:p-6 flex gap-4 ${index < cartItems.length - 1 ? 'border-b border-slate-100' : ''
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.product._id)}
                                            onChange={() => {
                                                if (selectedItems.includes(item.product._id)) {
                                                    setSelectedItems(prev => prev.filter(id => id !== item.product._id));
                                                } else {
                                                    setSelectedItems(prev => [...prev, item.product._id]);
                                                }
                                            }}
                                            className="w-5 h-5 text-amber-500 rounded mt-8"
                                        />
                                    </label>

                                    {/* Product Image */}
                                    <img
                                        src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                                        alt={item.product.title}
                                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                                    />

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="font-semibold text-slate-800 line-clamp-2">
                                                    {item.product.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {item.product.brand || 'GiftsNGifts Original'}
                                                </p>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {item.product.customizationAvailable?.logo && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                            <HiPhotograph className="w-3 h-3" />
                                                            Logo
                                                        </span>
                                                    )}
                                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <HiTruck className="w-3 h-3" />
                                                        5-7 days
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(item.product._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <HiTrash className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-slate-500">Qty:</span>
                                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-2 hover:bg-slate-100 disabled:opacity-50 transition"
                                                    >
                                                        <HiMinus className="w-4 h-4" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                                                        className="w-16 text-center border-x border-slate-200 py-2 focus:outline-none"
                                                        min="1"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                                        className="p-2 hover:bg-slate-100 transition"
                                                    >
                                                        <HiPlus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-800">
                                                    ₹{(item.product.price * item.quantity).toLocaleString()}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    ₹{item.product.price.toLocaleString()} × {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Customization Options */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <HiSparkles className="w-5 h-5 text-amber-500" />
                                Customize Your Gifts
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${customization.addLogo ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={customization.addLogo}
                                        onChange={(e) => setCustomization(prev => ({ ...prev, addLogo: e.target.checked }))}
                                        className="hidden"
                                    />
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${customization.addLogo ? 'bg-amber-500 text-white' : 'border border-slate-300'
                                        }`}>
                                        {customization.addLogo && <HiCheck className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">Add Company Logo</p>
                                        <p className="text-sm text-slate-500">₹50 per unit</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${customization.premiumPackaging ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={customization.premiumPackaging}
                                        onChange={(e) => setCustomization(prev => ({ ...prev, premiumPackaging: e.target.checked }))}
                                        className="hidden"
                                    />
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${customization.premiumPackaging ? 'bg-amber-500 text-white' : 'border border-slate-300'
                                        }`}>
                                        {customization.premiumPackaging && <HiCheck className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">Premium Packaging</p>
                                        <p className="text-sm text-slate-500">₹30 per unit</p>
                                    </div>
                                </label>

                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${customization.giftWrap ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        checked={customization.giftWrap}
                                        onChange={(e) => setCustomization(prev => ({ ...prev, giftWrap: e.target.checked }))}
                                        className="hidden"
                                    />
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${customization.giftWrap ? 'bg-amber-500 text-white' : 'border border-slate-300'
                                        }`}>
                                        {customization.giftWrap && <HiCheck className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">Gift Wrap</p>
                                        <p className="text-sm text-slate-500">₹20 per unit</p>
                                    </div>
                                </label>

                                {/* Custom Message */}
                                <div className="sm:col-span-2">
                                    <label className="block">
                                        <span className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                            <HiPencil className="w-4 h-4" />
                                            Custom Message (Free)
                                        </span>
                                        <textarea
                                            value={customization.customMessage}
                                            onChange={(e) => setCustomization(prev => ({ ...prev, customMessage: e.target.value }))}
                                            placeholder="Happy Diwali from Team Acme!"
                                            className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                            rows="2"
                                            maxLength={100}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">{customization.customMessage.length}/100</p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Smart Suggestions */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
                            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <HiLightningBolt className="w-5 h-5 text-purple-500" />
                                Smart Suggestions
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🎁</span>
                                        <div className="text-left">
                                            <p className="font-medium text-slate-800">Add greeting cards?</p>
                                            <p className="text-sm text-slate-500">₹20 each - makes gifts personal</p>
                                        </div>
                                    </div>
                                    <HiPlus className="w-5 h-5 text-purple-500" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">⚡</span>
                                        <div className="text-left">
                                            <p className="font-medium text-slate-800">Need express delivery?</p>
                                            <p className="text-sm text-slate-500">₹500 extra - get it in 3 days</p>
                                        </div>
                                    </div>
                                    <HiPlus className="w-5 h-5 text-purple-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right - Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Order Summary</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Subtotal ({orderSummary.totalQty} units)</span>
                                    <span className="font-medium">₹{orderSummary.itemsTotal.toLocaleString()}</span>
                                </div>

                                {orderSummary.bulkDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span className="flex items-center gap-1">
                                            <HiTag className="w-4 h-4" />
                                            Bulk Discount ({orderSummary.discountPercent}%)
                                        </span>
                                        <span className="font-medium">-₹{orderSummary.bulkDiscount.toLocaleString()}</span>
                                    </div>
                                )}

                                {orderSummary.customizationCost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Customization</span>
                                        <span className="font-medium">₹{orderSummary.customizationCost.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-slate-600">GST (18%)</span>
                                    <span className="font-medium">₹{Math.round(orderSummary.gst).toLocaleString()}</span>
                                </div>

                                <div className="border-t border-slate-200 pt-3 mt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-slate-800">Grand Total</span>
                                        <span className="text-amber-600">₹{Math.round(orderSummary.grandTotal).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleProceed}
                                    disabled={selectedItems.length === 0}
                                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceed to B2B Checkout
                                </button>

                                <button
                                    onClick={() => navigate('/bulk-quote')}
                                    className="w-full py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-amber-400 hover:bg-amber-50 transition flex items-center justify-center gap-2"
                                >
                                    <HiChatAlt className="w-5 h-5" />
                                    Request Custom Quote
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <HiShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <span>GST Invoice Included</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <HiPhotograph className="w-5 h-5 text-blue-500" />
                                    <span>Logo Branding Available</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <HiTruck className="w-5 h-5 text-purple-500" />
                                    <span>Pan-India Delivery</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <HiClock className="w-5 h-5 text-amber-500" />
                                    <span>5-7 Days Delivery</span>
                                </div>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                                <p className="text-sm text-amber-800">
                                    <strong>Estimated Delivery:</strong>
                                    <br />
                                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default B2BCart;
