/**
 * B2B Order Confirmation Page
 * Shows order details with timeline tracking for corporate orders
 */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HiCheckCircle, HiClock, HiTruck, HiDocumentText,
    HiDownload, HiPhone, HiMail, HiLocationMarker,
    HiPhotograph, HiCube, HiClipboardCheck, HiBadgeCheck
} from "react-icons/hi";
import api from "../../utils/api";

const ORDER_STEPS = [
    {
        id: 'confirmed',
        title: 'Order Confirmed',
        icon: HiClipboardCheck,
        description: 'Your order has been received and confirmed'
    },
    {
        id: 'logo_approval',
        title: 'Logo Approval',
        icon: HiPhotograph,
        description: 'Waiting for logo design approval'
    },
    {
        id: 'production',
        title: 'In Production',
        icon: HiCube,
        description: 'Your order is being crafted by our artisans'
    },
    {
        id: 'quality_check',
        title: 'Quality Check',
        icon: HiBadgeCheck,
        description: 'Final quality inspection in progress'
    },
    {
        id: 'dispatched',
        title: 'Dispatched',
        icon: HiTruck,
        description: 'Order shipped and on the way'
    },
    {
        id: 'delivered',
        title: 'Delivered',
        icon: HiCheckCircle,
        description: 'Order successfully delivered'
    }
];

function B2BOrderConfirmation() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await api.get(`/orders/b2b/${orderId}`);
            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            // Use sample data for demo
            setOrder(getSampleOrder(orderId));
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStepIndex = () => {
        if (!order) return 0;
        const stepIndex = ORDER_STEPS.findIndex(step => step.id === order.status);
        return stepIndex >= 0 ? stepIndex : 0;
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Order not found</p>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex();

    return (
        <div className="min-h-screen bg-[#fdfcfb]">
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');`}
            </style>

            {/* Success Header */}
            <section className="relative py-12 px-4 md:px-8 bg-gradient-to-br from-[#2C1A0F] via-[#3A2518] to-[#2C1A0F] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                    >
                        <HiCheckCircle className="w-12 h-12 text-green-400" />
                    </motion.div>

                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-3xl md:text-4xl text-white mb-3"
                    >
                        Order Confirmed!
                    </h1>
                    <p className="text-white/70 mb-4">
                        Thank you for choosing GiftsNGifts for your corporate gifting needs
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                        <span className="text-white/60 text-sm">Order ID:</span>
                        <span className="text-[#d4af37] font-mono font-medium">{order.orderId}</span>
                    </div>
                </div>
            </section>

            {/* Order Timeline */}
            <section className="py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-2xl text-[#332a21] mb-8 text-center"
                    >
                        Order Timeline
                    </h2>

                    {/* Progress Steps */}
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 md:hidden" />
                        <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gray-200" />

                        {/* Completed Progress */}
                        <div
                            className="hidden md:block absolute top-8 left-0 h-0.5 bg-[#d4af37] transition-all duration-500"
                            style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                        />

                        {/* Steps */}
                        <div className="md:flex md:justify-between relative">
                            {ORDER_STEPS.map((step, index) => {
                                const isCompleted = index < currentStep;
                                const isCurrent = index === currentStep;
                                const StepIcon = step.icon;

                                return (
                                    <div
                                        key={step.id}
                                        className={`flex md:flex-col items-start md:items-center gap-4 md:gap-2 
                                            mb-8 md:mb-0 md:flex-1 ${index === 0 ? '' : 'md:ml-4'}`}
                                    >
                                        {/* Icon Circle */}
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                                                transition-colors duration-300 ${isCompleted
                                                    ? 'bg-[#d4af37] text-white'
                                                    : isCurrent
                                                        ? 'bg-[#d4af37]/20 text-[#d4af37] ring-4 ring-[#d4af37]/30'
                                                        : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            <StepIcon className="w-7 h-7" />
                                            {isCompleted && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 
                                                    rounded-full flex items-center justify-center">
                                                    <HiCheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </motion.div>

                                        {/* Text */}
                                        <div className="md:text-center">
                                            <p className={`font-medium text-sm ${isCompleted || isCurrent ? 'text-[#332a21]' : 'text-gray-400'
                                                }`}>
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 hidden md:block max-w-[100px]">
                                                {step.description}
                                            </p>
                                            {isCurrent && order.timeline?.[index]?.date && (
                                                <p className="text-xs text-[#d4af37] mt-1">
                                                    {new Date(order.timeline[index].date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Estimated Delivery */}
                    <div className="mt-12 p-6 bg-[#f8f6f3] rounded-2xl text-center">
                        <p className="text-gray-500 text-sm mb-2">Estimated Delivery</p>
                        <p className="text-2xl font-serif text-[#332a21]">
                            {order.estimatedDelivery
                                ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })
                                : '7-10 Business Days'
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Order Details Grid */}
            <section className="py-8 px-4 md:px-8 bg-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-[#f8f6f3] rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-[#332a21] mb-4 flex items-center gap-2">
                            <HiDocumentText className="w-5 h-5 text-[#d4af37]" />
                            Order Summary
                        </h3>

                        <div className="space-y-4 mb-6">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={item.image || '/placeholder.jpg'}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[#332a21] line-clamp-1">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity} × ₹{item.unitPrice}
                                        </p>
                                        <p className="text-sm font-medium text-[#d4af37]">
                                            ₹{item.totalPrice?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Items Total</span>
                                <span>₹{order.pricing?.itemsTotal?.toLocaleString()}</span>
                            </div>
                            {order.pricing?.bulkDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Bulk Discount</span>
                                    <span>-₹{order.pricing.bulkDiscount.toLocaleString()}</span>
                                </div>
                            )}
                            {order.pricing?.customizationCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Customization</span>
                                    <span>₹{order.pricing.customizationCost.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span>{order.pricing?.shippingCost > 0 ? `₹${order.pricing.shippingCost}` : 'FREE'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">GST (18%)</span>
                                <span>₹{order.pricing?.gst?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200">
                                <span>Grand Total</span>
                                <span className="text-[#d4af37]">₹{order.pricing?.grandTotal?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery & Company Info */}
                    <div className="space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-[#f8f6f3] rounded-2xl p-6">
                            <h3 className="text-lg font-medium text-[#332a21] mb-4 flex items-center gap-2">
                                <HiLocationMarker className="w-5 h-5 text-[#d4af37]" />
                                {order.deliveryType === 'multiple' ? 'Delivery Addresses' : 'Delivery Address'}
                            </h3>

                            {order.deliveryType === 'multiple' ? (
                                <p className="text-sm text-gray-600">
                                    {order.recipientList?.length || 0} recipients • Address list uploaded
                                </p>
                            ) : (
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium text-[#332a21]">{order.shippingAddress?.contactPerson}</p>
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                    <p>{order.shippingAddress?.pincode}</p>
                                    <p className="mt-2 flex items-center gap-2">
                                        <HiPhone className="w-4 h-4" />
                                        {order.shippingAddress?.phone}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Company Info */}
                        <div className="bg-[#f8f6f3] rounded-2xl p-6">
                            <h3 className="text-lg font-medium text-[#332a21] mb-4">
                                Company Details
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                <p className="font-medium text-[#332a21]">{order.companyInfo?.companyName}</p>
                                {order.companyInfo?.gstNumber && (
                                    <p>GST: {order.companyInfo.gstNumber}</p>
                                )}
                                <p className="flex items-center gap-2">
                                    <HiMail className="w-4 h-4" />
                                    {order.companyInfo?.billingContact?.email}
                                </p>
                                <p className="flex items-center gap-2">
                                    <HiPhone className="w-4 h-4" />
                                    {order.companyInfo?.billingContact?.phone}
                                </p>
                            </div>
                        </div>

                        {/* Customization */}
                        {order.customization?.addLogo && (
                            <div className="bg-[#f8f6f3] rounded-2xl p-6">
                                <h3 className="text-lg font-medium text-[#332a21] mb-4 flex items-center gap-2">
                                    <HiPhotograph className="w-5 h-5 text-[#d4af37]" />
                                    Customization
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
                                        <img
                                            src={order.customization.logoFile || '/logo-placeholder.png'}
                                            alt="Logo"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[#332a21]">Logo Added</p>
                                        <p className="text-xs text-gray-500">Pending approval</p>
                                    </div>
                                </div>
                                {order.customization?.customMessage && (
                                    <div className="mt-4 p-3 bg-white rounded-lg">
                                        <p className="text-xs text-gray-400 mb-1">Custom Message:</p>
                                        <p className="text-sm italic">"{order.customization.customMessage}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Actions */}
            <section className="py-8 px-4 md:px-8">
                <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#332a21] text-white rounded-full hover:bg-[#1a1510] transition-colors">
                        <HiDownload className="w-5 h-5" />
                        Download Invoice
                    </button>
                    <Link
                        to={`/order-tracking/${order.orderId}`}
                        className="flex items-center gap-2 px-6 py-3 border border-[#332a21] text-[#332a21] rounded-full hover:bg-[#332a21]/5 transition-colors"
                    >
                        <HiTruck className="w-5 h-5" />
                        Track Order
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </section>

            {/* Support Banner */}
            <section className="py-8 px-4 md:px-8 bg-[#f8f6f3]">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-600 mb-4">
                        Need help with your order? Our corporate gifting team is here to assist.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a href="tel:+919876543210" className="flex items-center gap-2 text-[#332a21] hover:text-[#d4af37] transition-colors">
                            <HiPhone className="w-5 h-5" />
                            +91 98765 43210
                        </a>
                        <a href="mailto:corporate@giftsngifts.in" className="flex items-center gap-2 text-[#332a21] hover:text-[#d4af37] transition-colors">
                            <HiMail className="w-5 h-5" />
                            corporate@giftsngifts.in
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#fdfcfb] py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="bg-gray-200 h-32 rounded-2xl" />
                    <div className="bg-gray-200 h-48 rounded-2xl" />
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-200 h-64 rounded-2xl" />
                        <div className="bg-gray-200 h-64 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sample order data
function getSampleOrder(orderId) {
    return {
        orderId: orderId || 'GNG-B2B-2026-001234',
        status: 'production',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        items: [
            {
                title: 'Premium Assam Tea Gift Hamper',
                quantity: 100,
                unitPrice: 899,
                totalPrice: 89900,
                image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200'
            },
            {
                title: 'Handwoven Bamboo Office Organizer',
                quantity: 100,
                unitPrice: 449,
                totalPrice: 44900,
                image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=200'
            }
        ],
        pricing: {
            itemsTotal: 134800,
            bulkDiscount: 13480,
            customizationCost: 5000,
            shippingCost: 0,
            subtotal: 126320,
            gst: 22738,
            grandTotal: 149058
        },
        companyInfo: {
            companyName: 'TechCorp India Pvt. Ltd.',
            gstNumber: '27AABCT1234E1Z5',
            billingContact: {
                name: 'Priya Sharma',
                email: 'priya@techcorp.com',
                phone: '+91 98765 43210'
            }
        },
        deliveryType: 'single',
        shippingAddress: {
            address: '123, Tech Park, Whitefield',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560066',
            contactPerson: 'Rahul Kumar',
            phone: '+91 87654 32109'
        },
        customization: {
            addLogo: true,
            logoFile: null,
            customMessage: 'Thank you for your continued partnership!',
            premiumPackaging: true
        },
        timeline: [
            { step: 'confirmed', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completed: true },
            { step: 'logo_approval', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: true },
            { step: 'production', date: new Date(), completed: false }
        ]
    };
}

export default B2BOrderConfirmation;
