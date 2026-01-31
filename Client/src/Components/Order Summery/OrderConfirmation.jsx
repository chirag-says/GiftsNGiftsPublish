/**
 * Order Confirmation Page
 * Post-purchase experience with timeline, tracking, and next steps
 */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HiCheck, HiClock, HiTruck, HiMail, HiPhone,
    HiDownload, HiCalendar, HiPrinter, HiShare,
    HiLocationMarker, HiCube, HiGift, HiSparkles,
    HiArrowRight, HiChatAlt
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Get order details from navigation state or fetch from API
        if (location.state?.orderId) {
            setOrderData({
                orderId: location.state.orderId,
                orderDetails: location.state.orderDetails || generateMockOrder()
            });
        } else {
            // For demo purposes, generate mock data
            setOrderData({
                orderId: `GNG-${Date.now().toString().slice(-6)}`,
                orderDetails: generateMockOrder()
            });
        }
    }, [location]);

    const generateMockOrder = () => ({
        companyName: "Acme Corporation",
        billingEmail: "procurement@acme.com",
        billingPhone: "+91 98765 43210",
        totalItems: 50,
        grandTotal: 59950,
        estimatedDelivery: addDays(new Date(), 7),
        timeline: [
            { step: "Order Placed", date: new Date(), completed: true },
            { step: "Logo Approval", date: addDays(new Date(), 2), completed: false },
            { step: "Production Starts", date: addDays(new Date(), 3), completed: false },
            { step: "Quality Check", date: addDays(new Date(), 5), completed: false },
            { step: "Dispatch", date: addDays(new Date(), 6), completed: false },
            { step: "Delivery", date: addDays(new Date(), 7), completed: false }
        ],
        items: [
            { name: "Assam Tea Diwali Hamper", quantity: 50, price: 1099 }
        ],
        customization: {
            logo: true,
            message: "Happy Diwali from Team Acme!",
            premiumPackaging: true
        }
    });

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const { orderId, orderDetails } = orderData;

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50/20 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-200"
                    >
                        <HiCheck className="w-12 h-12 text-white" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-4xl font-bold text-slate-900 mb-3"
                    >
                        Order Confirmed! 🎉
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-slate-600"
                    >
                        Thank you for choosing GiftsNGifts!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full"
                    >
                        <span className="text-sm text-slate-500">Order ID:</span>
                        <span className="font-mono font-bold text-slate-800">{orderId}</span>
                    </motion.div>
                </motion.div>

                {/* Notification Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl p-6 shadow-sm mb-8"
                >
                    <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <HiMail className="w-5 h-5 text-blue-500" />
                        Confirmation Sent
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <HiMail className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-slate-500">Email</p>
                                <p className="font-medium text-slate-800">{orderDetails.billingEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                            <FaWhatsapp className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-xs text-slate-500">WhatsApp Updates</p>
                                <p className="font-medium text-slate-800">{orderDetails.billingPhone}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Order Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl p-6 shadow-sm mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <HiClock className="w-5 h-5 text-amber-500" />
                            Order Timeline
                        </h2>
                        <span className="text-sm text-amber-600 font-medium">
                            Est. Delivery: {formatDate(orderDetails.estimatedDelivery)}
                        </span>
                    </div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                        {/* Timeline Steps */}
                        <div className="space-y-6">
                            {orderDetails.timeline.map((item, index) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    className="relative flex items-start gap-4"
                                >
                                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${item.completed
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white border-2 border-slate-200 text-slate-400'
                                        }`}>
                                        {item.completed ? (
                                            <HiCheck className="w-6 h-6" />
                                        ) : (
                                            index === 1 ? <HiSparkles className="w-5 h-5" /> :
                                                index === 2 ? <HiCube className="w-5 h-5" /> :
                                                    index === 3 ? <HiCheck className="w-5 h-5" /> :
                                                        index === 4 ? <HiTruck className="w-5 h-5" /> :
                                                            <HiGift className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <p className={`font-medium ${item.completed ? 'text-slate-800' : 'text-slate-500'}`}>
                                            {item.step}
                                        </p>
                                        <p className="text-sm text-slate-400">{formatDate(item.date)}</p>
                                    </div>
                                    {item.completed && (
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                            Completed
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* What's Next */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 mb-8"
                >
                    <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <HiCalendar className="w-5 h-5 text-amber-600" />
                        What's Next?
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                            <div>
                                <p className="font-medium text-slate-800">Our team will contact you in 24 hours</p>
                                <p className="text-sm text-slate-600">To confirm order details and customization requirements</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                            <div>
                                <p className="font-medium text-slate-800">Logo proof approval (2 days)</p>
                                <p className="text-sm text-slate-600">We'll send you a digital mockup for approval</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                            <div>
                                <p className="font-medium text-slate-800">Production updates via WhatsApp</p>
                                <p className="text-sm text-slate-600">Stay informed with real-time progress updates</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                            <div>
                                <p className="font-medium text-slate-800">Tracking info before dispatch</p>
                                <p className="text-sm text-slate-600">Full visibility into delivery status</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="bg-white rounded-2xl p-6 shadow-sm mb-8"
                >
                    <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition">
                            <HiLocationMarker className="w-6 h-6 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Track Order</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition">
                            <HiDownload className="w-6 h-6 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Download Invoice</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition">
                            <HiPhone className="w-6 h-6 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Contact Us</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition">
                            <HiShare className="w-6 h-6 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Share Order</span>
                        </button>
                    </div>
                </motion.div>

                {/* While You Wait */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-8"
                >
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <HiSparkles className="w-5 h-5" />
                        While You Wait
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Link
                            to="/shop-by-occasion/new-year"
                            className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition"
                        >
                            <span>🎄</span>
                            <div className="flex-1">
                                <p className="font-medium">Plan New Year Gifts</p>
                                <p className="text-sm text-purple-200">Browse collection →</p>
                            </div>
                        </Link>
                        <Link
                            to="/bulk-quote"
                            className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition"
                        >
                            <span>📊</span>
                            <div className="flex-1">
                                <p className="font-medium">Download Tracking Sheet</p>
                                <p className="text-sm text-purple-200">Excel template →</p>
                            </div>
                        </Link>
                        <Link
                            to="/gift-finder"
                            className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition"
                        >
                            <span>💡</span>
                            <div className="flex-1">
                                <p className="font-medium">Gift Ideas</p>
                                <p className="text-sm text-purple-200">Take quiz →</p>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Order Details Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm text-slate-500 mb-2">Items Ordered</h3>
                            {orderDetails.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <span className="text-slate-700">{item.name}</span>
                                    <span className="text-slate-500">×{item.quantity}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4">
                                <span className="font-semibold text-slate-800">Total Amount</span>
                                <span className="font-bold text-lg text-amber-600">₹{orderDetails.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm text-slate-500 mb-2">Customization</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-700">
                                    <HiCheck className={`w-5 h-5 ${orderDetails.customization.logo ? 'text-emerald-500' : 'text-slate-300'}`} />
                                    <span>Company Logo</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <HiCheck className={`w-5 h-5 ${orderDetails.customization.premiumPackaging ? 'text-emerald-500' : 'text-slate-300'}`} />
                                    <span>Premium Packaging</span>
                                </div>
                                {orderDetails.customization.message && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Custom Message:</p>
                                        <p className="text-sm text-slate-700 italic">"{orderDetails.customization.message}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Continue Shopping Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-center mt-12"
                >
                    <button
                        onClick={() => navigate('/shop-by-occasion')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition shadow-lg shadow-amber-200"
                    >
                        Continue Shopping
                        <HiArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Need Help */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                    className="text-center mt-8 pb-8"
                >
                    <p className="text-slate-500 mb-2">Need help with your order?</p>
                    <div className="flex items-center justify-center gap-4">
                        <a href="tel:+919876543210" className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
                            <HiPhone className="w-5 h-5" />
                            <span>+91 98765 43210</span>
                        </a>
                        <span className="text-slate-300">|</span>
                        <a href="mailto:support@giftsingifts.com" className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
                            <HiMail className="w-5 h-5" />
                            <span>support@giftsingifts.com</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default OrderConfirmation;
