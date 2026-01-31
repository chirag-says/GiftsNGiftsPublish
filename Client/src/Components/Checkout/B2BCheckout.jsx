/**
 * B2B Checkout Component
 * Professional checkout experience for corporate gifting orders
 * Features: Company info, GST, multiple addresses, CSV upload, logo customization
 */
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/Appcontext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
    HiOfficeBuilding, HiDocumentText, HiLocationMarker,
    HiPhotograph, HiCreditCard, HiCheck, HiArrowLeft,
    HiArrowRight, HiUpload, HiDownload, HiUsers, HiPencil,
    HiShieldCheck, HiClock, HiTruck, HiCube
} from "react-icons/hi";

const CHECKOUT_STEPS = [
    { id: 1, title: "Company Info", icon: HiOfficeBuilding },
    { id: 2, title: "Delivery", icon: HiLocationMarker },
    { id: 3, title: "Customization", icon: HiPencil },
    { id: 4, title: "Payment", icon: HiCreditCard }
];

function B2BCheckout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, user, fetchCart } = useContext(AppContext);

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSummary, setOrderSummary] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        // Company Info
        companyName: "",
        gstNumber: "",
        billingContact: "",
        billingEmail: "",
        billingPhone: "",
        panNumber: "",

        // Delivery
        deliveryType: "single", // single | multiple
        singleAddress: {
            name: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            phone: ""
        },
        recipientList: [], // For CSV upload
        csvFile: null,

        // Customization
        addLogo: false,
        logoFile: null,
        customMessage: "",
        premiumPackaging: true,
        giftWrap: false,
        includeGreetingCard: true,
        greetingCardMessage: "",

        // Payment
        paymentMethod: "online", // online | invoice | bank
        termsAccepted: false
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCart();
        calculateOrderSummary();
    }, [cartItems]);

    const calculateOrderSummary = () => {
        if (!cartItems.length) return;

        const itemsTotal = cartItems.reduce((acc, item) => {
            const price = item.product?.price || 0;
            const qty = item.quantity || 1;
            return acc + (price * qty);
        }, 0);

        // Calculate bulk discounts
        const totalQty = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
        let discountPercent = 0;
        if (totalQty >= 500) discountPercent = 20;
        else if (totalQty >= 100) discountPercent = 15;
        else if (totalQty >= 50) discountPercent = 10;
        else if (totalQty >= 25) discountPercent = 5;

        const bulkDiscount = (itemsTotal * discountPercent) / 100;
        const customizationCost = (formData.addLogo ? 50 * totalQty : 0) +
            (formData.premiumPackaging ? 30 * totalQty : 0) +
            (formData.giftWrap ? 20 * totalQty : 0);
        const gst = ((itemsTotal - bulkDiscount + customizationCost) * 18) / 100;
        const grandTotal = itemsTotal - bulkDiscount + customizationCost + gst;

        setOrderSummary({
            itemsTotal,
            totalQty,
            discountPercent,
            bulkDiscount,
            customizationCost,
            gst,
            grandTotal
        });
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const updateNestedFormData = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
                if (!formData.billingContact.trim()) newErrors.billingContact = "Contact name is required";
                if (!formData.billingEmail.trim()) newErrors.billingEmail = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
                    newErrors.billingEmail = "Invalid email format";
                }
                if (!formData.billingPhone.trim()) newErrors.billingPhone = "Phone is required";
                break;

            case 2:
                if (formData.deliveryType === "single") {
                    if (!formData.singleAddress.name.trim()) newErrors.addressName = "Recipient name required";
                    if (!formData.singleAddress.address.trim()) newErrors.address = "Address required";
                    if (!formData.singleAddress.city.trim()) newErrors.city = "City required";
                    if (!formData.singleAddress.pincode.trim()) newErrors.pincode = "Pincode required";
                }
                break;

            case 3:
                if (formData.addLogo && !formData.logoFile) {
                    newErrors.logoFile = "Please upload your logo";
                }
                break;

            case 4:
                if (!formData.termsAccepted) {
                    newErrors.terms = "Please accept terms and conditions";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/png', 'image/jpeg', 'application/postscript', 'application/pdf'].includes(file.type)) {
                toast.error("Please upload PNG, JPEG, AI, or PDF file");
                return;
            }
            updateFormData('logoFile', file);
        }
    };

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            updateFormData('csvFile', file);
            // Parse CSV (simplified)
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').slice(1); // Skip header
                const recipients = lines.map(line => {
                    const [name, address, city, state, pincode, phone] = line.split(',');
                    return { name, address, city, state, pincode, phone };
                }).filter(r => r.name);
                updateFormData('recipientList', recipients);
                toast.success(`Loaded ${recipients.length} recipients`);
            };
            reader.readAsText(file);
        }
    };

    const downloadCSVTemplate = () => {
        const csv = "Name,Address,City,State,Pincode,Phone\nJohn Doe,123 Main St,Mumbai,Maharashtra,400001,9876543210";
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recipient_template.csv';
        a.click();
    };

    const handleSubmitOrder = async () => {
        if (!validateStep(4)) return;
        setIsSubmitting(true);

        try {
            const orderData = new FormData();
            orderData.append('companyInfo', JSON.stringify({
                companyName: formData.companyName,
                gstNumber: formData.gstNumber,
                panNumber: formData.panNumber,
                billingContact: formData.billingContact,
                billingEmail: formData.billingEmail,
                billingPhone: formData.billingPhone
            }));

            orderData.append('deliveryType', formData.deliveryType);
            if (formData.deliveryType === 'single') {
                orderData.append('shippingAddress', JSON.stringify(formData.singleAddress));
            } else {
                orderData.append('recipientList', JSON.stringify(formData.recipientList));
            }

            orderData.append('customization', JSON.stringify({
                addLogo: formData.addLogo,
                customMessage: formData.customMessage,
                premiumPackaging: formData.premiumPackaging,
                giftWrap: formData.giftWrap,
                includeGreetingCard: formData.includeGreetingCard,
                greetingCardMessage: formData.greetingCardMessage
            }));

            if (formData.logoFile) {
                orderData.append('logoFile', formData.logoFile);
            }

            orderData.append('paymentMethod', formData.paymentMethod);
            orderData.append('items', JSON.stringify(cartItems.map(item => ({
                productId: item.product._id,
                quantity: item.quantity
            }))));

            const response = await api.post('/api/orders/b2b-checkout', orderData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success("Order placed successfully!");
                navigate('/order-confirmation', {
                    state: {
                        orderId: response.data.orderId,
                        orderDetails: response.data.orderDetails
                    }
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Order failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!cartItems.length) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50/20 flex items-center justify-center">
                <div className="text-center p-12 bg-white rounded-3xl shadow-xl">
                    <HiCube className="w-16 h-16 mx-auto text-slate-300 mb-6" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
                    <button
                        onClick={() => navigate('/shop-by-occasion')}
                        className="px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
                    >
                        Start Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/20 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition mb-4"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                        <span>Back to Cart</span>
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">B2B Checkout</h1>
                    <p className="text-slate-600 mt-2">Complete your corporate order</p>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left - Form Steps */}
                    <div className="lg:w-2/3">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-4 shadow-sm">
                            {CHECKOUT_STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <React.Fragment key={step.id}>
                                        <div
                                            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition cursor-pointer ${isActive ? 'bg-amber-100 text-amber-800' :
                                                    isCompleted ? 'bg-emerald-50 text-emerald-700' :
                                                        'text-slate-400'
                                                }`}
                                            onClick={() => isCompleted && setCurrentStep(step.id)}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-500 text-white' :
                                                    isCompleted ? 'bg-emerald-500 text-white' :
                                                        'bg-slate-100'
                                                }`}>
                                                {isCompleted ? <HiCheck className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                                            </div>
                                            <span className="font-medium hidden sm:block">{step.title}</span>
                                        </div>
                                        {idx < CHECKOUT_STEPS.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-2xl p-6 shadow-sm"
                            >
                                {/* Step 1: Company Info */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-800 mb-4">Company Information</h2>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Company Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.companyName}
                                                    onChange={(e) => updateFormData('companyName', e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.companyName ? 'border-red-300' : 'border-slate-200'} focus:border-amber-400 focus:ring-2 focus:ring-amber-100`}
                                                    placeholder="Acme Corporation"
                                                />
                                                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    GST Number (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.gstNumber}
                                                    onChange={(e) => updateFormData('gstNumber', e.target.value.toUpperCase())}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                                    placeholder="22AAAAA0000A1Z5"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Billing Contact Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billingContact}
                                                    onChange={(e) => updateFormData('billingContact', e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.billingContact ? 'border-red-300' : 'border-slate-200'} focus:border-amber-400 focus:ring-2 focus:ring-amber-100`}
                                                    placeholder="John Doe"
                                                />
                                                {errors.billingContact && <p className="text-red-500 text-sm mt-1">{errors.billingContact}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    PAN Number (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.panNumber}
                                                    onChange={(e) => updateFormData('panNumber', e.target.value.toUpperCase())}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                                    placeholder="ABCDE1234F"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.billingEmail}
                                                    onChange={(e) => updateFormData('billingEmail', e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.billingEmail ? 'border-red-300' : 'border-slate-200'} focus:border-amber-400 focus:ring-2 focus:ring-amber-100`}
                                                    placeholder="procurement@company.com"
                                                />
                                                {errors.billingEmail && <p className="text-red-500 text-sm mt-1">{errors.billingEmail}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Phone *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.billingPhone}
                                                    onChange={(e) => updateFormData('billingPhone', e.target.value)}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.billingPhone ? 'border-red-300' : 'border-slate-200'} focus:border-amber-400 focus:ring-2 focus:ring-amber-100`}
                                                    placeholder="+91 98765 43210"
                                                />
                                                {errors.billingPhone && <p className="text-red-500 text-sm mt-1">{errors.billingPhone}</p>}
                                            </div>
                                        </div>

                                        {/* Trust badges */}
                                        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <HiShieldCheck className="w-5 h-5 text-emerald-500" />
                                                <span>GST Invoice Provided</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <HiDocumentText className="w-5 h-5 text-blue-500" />
                                                <span>Company Billing Available</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Delivery */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-800 mb-4">Delivery Details</h2>

                                        {/* Delivery Type Toggle */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => updateFormData('deliveryType', 'single')}
                                                className={`flex-1 p-4 rounded-xl border-2 transition ${formData.deliveryType === 'single'
                                                        ? 'border-amber-400 bg-amber-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <HiLocationMarker className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                                                <p className="font-medium text-slate-800">Single Address</p>
                                                <p className="text-sm text-slate-500">All gifts to one location</p>
                                            </button>

                                            <button
                                                onClick={() => updateFormData('deliveryType', 'multiple')}
                                                className={`flex-1 p-4 rounded-xl border-2 transition ${formData.deliveryType === 'multiple'
                                                        ? 'border-amber-400 bg-amber-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <HiUsers className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                                                <p className="font-medium text-slate-800">Multiple Addresses</p>
                                                <p className="text-sm text-slate-500">Individual recipient delivery</p>
                                            </button>
                                        </div>

                                        {/* Single Address Form */}
                                        {formData.deliveryType === 'single' && (
                                            <div className="space-y-4 pt-4">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                                            Recipient Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.singleAddress.name}
                                                            onChange={(e) => updateNestedFormData('singleAddress', 'name', e.target.value)}
                                                            className={`w-full px-4 py-3 rounded-xl border ${errors.addressName ? 'border-red-300' : 'border-slate-200'} focus:border-amber-400`}
                                                            placeholder="Office Admin / Warehouse"
                                                        />
                                                        {errors.addressName && <p className="text-red-500 text-sm mt-1">{errors.addressName}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                                            Phone *
                                                        </label>
                                                        <input
                                                            type="tel"
                                                            value={formData.singleAddress.phone}
                                                            onChange={(e) => updateNestedFormData('singleAddress', 'phone', e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400"
                                                            placeholder="+91 98765 43210"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                                        Address *
                                                    </label>
                                                    <textarea
                                                        value={formData.singleAddress.address}
                                                        onChange={(e) => updateNestedFormData('singleAddress', 'address', e.target.value)}
                                                        className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-300' : 'border-slate-200'} focus:border-amber-400`}
                                                        rows="2"
                                                        placeholder="Building, Street, Area..."
                                                    />
                                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                                </div>

                                                <div className="grid md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                                                        <input
                                                            type="text"
                                                            value={formData.singleAddress.city}
                                                            onChange={(e) => updateNestedFormData('singleAddress', 'city', e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                                                        <input
                                                            type="text"
                                                            value={formData.singleAddress.state}
                                                            onChange={(e) => updateNestedFormData('singleAddress', 'state', e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Pincode *</label>
                                                        <input
                                                            type="text"
                                                            value={formData.singleAddress.pincode}
                                                            onChange={(e) => updateNestedFormData('singleAddress', 'pincode', e.target.value)}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Multiple Addresses - CSV Upload */}
                                        {formData.deliveryType === 'multiple' && (
                                            <div className="space-y-4 pt-4">
                                                <div className="bg-blue-50 rounded-xl p-6 text-center">
                                                    <HiUpload className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                                                    <h3 className="font-semibold text-slate-800 mb-2">Upload Recipient List</h3>
                                                    <p className="text-sm text-slate-600 mb-4">
                                                        Upload a CSV file with recipient details
                                                    </p>

                                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                        <label className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition inline-flex items-center gap-2">
                                                            <HiUpload className="w-5 h-5" />
                                                            Upload CSV
                                                            <input
                                                                type="file"
                                                                accept=".csv"
                                                                onChange={handleCSVUpload}
                                                                className="hidden"
                                                            />
                                                        </label>

                                                        <button
                                                            onClick={downloadCSVTemplate}
                                                            className="px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition inline-flex items-center gap-2"
                                                        >
                                                            <HiDownload className="w-5 h-5" />
                                                            Download Template
                                                        </button>
                                                    </div>

                                                    {formData.recipientList.length > 0 && (
                                                        <div className="mt-4 p-3 bg-emerald-100 rounded-lg text-emerald-700">
                                                            ✓ {formData.recipientList.length} recipients loaded
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 3: Customization */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-800 mb-4">Customize Your Gifts</h2>

                                        {/* Logo Upload */}
                                        <div className="border rounded-xl p-6">
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    id="addLogo"
                                                    checked={formData.addLogo}
                                                    onChange={(e) => updateFormData('addLogo', e.target.checked)}
                                                    className="mt-1 w-5 h-5 text-amber-500 rounded"
                                                />
                                                <div className="flex-1">
                                                    <label htmlFor="addLogo" className="font-medium text-slate-800 cursor-pointer">
                                                        Add Company Logo
                                                    </label>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Brand your gifts with your company logo (₹50/unit)
                                                    </p>

                                                    {formData.addLogo && (
                                                        <div className="mt-4">
                                                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
                                                                <HiPhotograph className="w-5 h-5 text-slate-600" />
                                                                <span>{formData.logoFile ? formData.logoFile.name : 'Upload Logo'}</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*,.ai,.eps,.pdf"
                                                                    onChange={handleLogoUpload}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                            {errors.logoFile && <p className="text-red-500 text-sm mt-1">{errors.logoFile}</p>}
                                                            <p className="text-xs text-slate-400 mt-2">Supported: PNG, JPEG, AI, PDF</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Custom Message */}
                                        <div className="border rounded-xl p-6">
                                            <label className="font-medium text-slate-800 block mb-4">
                                                Custom Message Card
                                            </label>
                                            <textarea
                                                value={formData.customMessage}
                                                onChange={(e) => updateFormData('customMessage', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400"
                                                rows="3"
                                                placeholder="Wishing you a Happy Diwali! Best wishes from Team Acme..."
                                                maxLength={150}
                                            />
                                            <p className="text-sm text-slate-400 mt-1">{formData.customMessage.length}/150 characters</p>
                                        </div>

                                        {/* Packaging Options */}
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <label className={`p-4 border rounded-xl cursor-pointer transition ${formData.premiumPackaging ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.premiumPackaging}
                                                    onChange={(e) => updateFormData('premiumPackaging', e.target.checked)}
                                                    className="hidden"
                                                />
                                                <p className="font-medium text-slate-800">Premium Packaging</p>
                                                <p className="text-sm text-slate-500">₹30/unit</p>
                                            </label>

                                            <label className={`p-4 border rounded-xl cursor-pointer transition ${formData.giftWrap ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.giftWrap}
                                                    onChange={(e) => updateFormData('giftWrap', e.target.checked)}
                                                    className="hidden"
                                                />
                                                <p className="font-medium text-slate-800">Gift Wrap</p>
                                                <p className="text-sm text-slate-500">₹20/unit</p>
                                            </label>

                                            <label className={`p-4 border rounded-xl cursor-pointer transition ${formData.includeGreetingCard ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.includeGreetingCard}
                                                    onChange={(e) => updateFormData('includeGreetingCard', e.target.checked)}
                                                    className="hidden"
                                                />
                                                <p className="font-medium text-slate-800">Greeting Card</p>
                                                <p className="text-sm text-slate-500">Included free</p>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Payment */}
                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-bold text-slate-800 mb-4">Payment Method</h2>

                                        <div className="space-y-3">
                                            {[
                                                { id: 'online', title: 'Pay Online', desc: 'Cards, UPI, Netbanking', icon: HiCreditCard },
                                                { id: 'invoice', title: 'Proforma Invoice', desc: '30-day payment terms (for approved businesses)', icon: HiDocumentText },
                                                { id: 'bank', title: 'Bank Transfer', desc: 'NEFT/RTGS to our account', icon: HiOfficeBuilding }
                                            ].map(method => (
                                                <label
                                                    key={method.id}
                                                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${formData.paymentMethod === method.id
                                                            ? 'border-amber-400 bg-amber-50'
                                                            : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method.id}
                                                        checked={formData.paymentMethod === method.id}
                                                        onChange={(e) => updateFormData('paymentMethod', e.target.value)}
                                                        className="w-5 h-5 text-amber-500"
                                                    />
                                                    <method.icon className="w-6 h-6 text-slate-600" />
                                                    <div>
                                                        <p className="font-medium text-slate-800">{method.title}</p>
                                                        <p className="text-sm text-slate-500">{method.desc}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Terms */}
                                        <label className="flex items-start gap-3 mt-6">
                                            <input
                                                type="checkbox"
                                                checked={formData.termsAccepted}
                                                onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                                                className="mt-1 w-5 h-5 text-amber-500 rounded"
                                            />
                                            <span className="text-sm text-slate-600">
                                                I agree to the <a href="/terms" className="text-amber-600 underline">Terms & Conditions</a> and <a href="/privacy" className="text-amber-600 underline">Privacy Policy</a>
                                            </span>
                                        </label>
                                        {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${currentStep === 1
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                <HiArrowLeft className="w-5 h-5" />
                                Previous
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition"
                                >
                                    Continue
                                    <HiArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Place Order
                                            <HiCheck className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right - Order Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>

                            {/* Items */}
                            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                                {cartItems.map((item) => (
                                    <div key={item.product._id} className="flex gap-3">
                                        <img
                                            src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                                            alt={item.product.title}
                                            className="w-14 h-14 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{item.product.title}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            ₹{(item.product.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal ({orderSummary?.totalQty} items)</span>
                                    <span>₹{orderSummary?.itemsTotal?.toLocaleString()}</span>
                                </div>

                                {orderSummary?.bulkDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Bulk Discount ({orderSummary.discountPercent}%)</span>
                                        <span>-₹{orderSummary.bulkDiscount.toLocaleString()}</span>
                                    </div>
                                )}

                                {orderSummary?.customizationCost > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Customization</span>
                                        <span>₹{orderSummary.customizationCost.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">GST (18%)</span>
                                    <span>₹{orderSummary?.gst?.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                                    <span>Grand Total</span>
                                    <span className="text-amber-600">₹{orderSummary?.grandTotal?.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-800">
                                    <HiTruck className="w-5 h-5" />
                                    <span className="font-medium">Estimated Delivery</span>
                                </div>
                                <p className="text-sm text-amber-700 mt-1">5-7 business days</p>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                                    <HiShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                                    <HiDocumentText className="w-4 h-4 text-blue-500" />
                                    <span>GST Invoice</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default B2BCheckout;
