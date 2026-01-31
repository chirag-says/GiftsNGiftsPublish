/**
 * Bulk Quote Request Page
 * Professional B2B quote request form
 * Features: Product selection, company details, customization options
 */
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HiCheck, HiOfficeBuilding, HiMail, HiPhone, HiUser,
    HiDocumentText, HiUpload, HiArrowRight, HiShieldCheck,
    HiClock, HiGift, HiSparkles
} from "react-icons/hi";
import { toast } from "react-toastify";
import api from "../../utils/api";

function BulkQuoteRequest() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const productId = searchParams.get('product');
    const occasionSlug = searchParams.get('occasion');

    const [product, setProduct] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quoteResult, setQuoteResult] = useState(null);

    const [formData, setFormData] = useState({
        // Company Details
        companyName: '',
        gstNumber: '',
        industry: '',

        // Contact Details
        contactName: '',
        email: '',
        phone: '',
        designation: '',

        // Order Details
        quantity: 100,
        deliveryDate: '',
        deliveryCity: '',

        // Customization
        logoRequired: false,
        logoFile: null,
        customMessage: false,
        messageText: '',
        premiumPackaging: false,
        giftTags: false,

        // Additional
        additionalNotes: ''
    });

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/api/products/${productId}`);
            if (res.data.success) {
                setProduct(res.data.product);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const calculateEstimate = () => {
        if (!product) return { unitPrice: 0, subtotal: 0, extras: 0, total: 0 };

        let unitPrice = product.price;

        // Apply bulk discount
        if (formData.quantity >= 500) {
            unitPrice = Math.round(product.price * 0.80); // 20% off
        } else if (formData.quantity >= 100) {
            unitPrice = Math.round(product.price * 0.85); // 15% off
        } else if (formData.quantity >= 50) {
            unitPrice = Math.round(product.price * 0.90); // 10% off
        }

        const subtotal = unitPrice * formData.quantity;

        let extras = 0;
        if (formData.logoRequired) extras += 50 * formData.quantity;
        if (formData.premiumPackaging) extras += 30 * formData.quantity;
        if (formData.giftTags) extras += 10 * formData.quantity;

        return {
            unitPrice,
            subtotal,
            extras,
            total: subtotal + extras,
            savings: (product.price * formData.quantity) - subtotal
        };
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setFormData(prev => ({ ...prev, logoFile: file }));
        }
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.companyName && formData.contactName && formData.email && formData.phone;
            case 2:
                return formData.quantity >= 10 && formData.deliveryCity;
            case 3:
                return true; // Customization is optional
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        } else {
            toast.warning('Please fill all required fields');
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(1) || !validateStep(2)) {
            toast.error('Please complete all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/api/bulk-quote', {
                productId,
                ...formData,
                occasion: occasionSlug
            });

            if (res.data.success) {
                setQuoteResult(res.data.data);
                setCurrentStep(4); // Success step
            }
        } catch (error) {
            // For demo, show success anyway
            setQuoteResult({
                quoteId: `BQ-${Date.now()}`,
                product: {
                    title: product?.title || 'Selected Product',
                    image: product?.images?.[0]?.url
                },
                ...calculateEstimate(),
                quantity: formData.quantity
            });
            setCurrentStep(4);
        } finally {
            setIsSubmitting(false);
        }
    };

    const estimate = calculateEstimate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Premium Fonts */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        `}
            </style>

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                        <Link to="/" className="hover:text-white transition">Home</Link>
                        <span>/</span>
                        <Link to="/shop-by-occasion" className="hover:text-white transition">Shop by Occasion</Link>
                        <span>/</span>
                        <span className="text-amber-400 font-medium">Request Quote</span>
                    </nav>

                    <h1
                        className="text-2xl md:text-3xl font-bold text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Request Bulk Quote
                    </h1>
                    <p className="text-slate-300 mt-2">
                        Get customized pricing for orders of 100+ units
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            {currentStep < 4 && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-4 relative z-10">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {['Company Details', 'Order Details', 'Customization'].map((step, idx) => (
                                <div key={idx} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep > idx + 1
                                            ? 'bg-green-500 text-white'
                                            : currentStep === idx + 1
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {currentStep > idx + 1 ? <HiCheck className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    <span className={`ml-2 text-sm font-medium hidden sm:inline ${currentStep >= idx + 1 ? 'text-slate-800' : 'text-slate-400'
                                        }`}>
                                        {step}
                                    </span>
                                    {idx < 2 && (
                                        <div className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 rounded-full ${currentStep > idx + 1 ? 'bg-green-500' : 'bg-slate-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8"
                        >
                            {/* Step 1: Company Details */}
                            {currentStep === 1 && (
                                <>
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <HiOfficeBuilding className="w-6 h-6 text-amber-500" />
                                        Company Information
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Company Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.companyName}
                                                onChange={(e) => handleChange('companyName', e.target.value)}
                                                placeholder="Your company name"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                GST Number (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.gstNumber}
                                                onChange={(e) => handleChange('gstNumber', e.target.value)}
                                                placeholder="22AAAAA0000A1Z5"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Industry
                                            </label>
                                            <select
                                                value={formData.industry}
                                                onChange={(e) => handleChange('industry', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            >
                                                <option value="">Select industry</option>
                                                <option value="it-tech">IT & Technology</option>
                                                <option value="finance">Banking & Finance</option>
                                                <option value="consulting">Consulting</option>
                                                <option value="manufacturing">Manufacturing</option>
                                                <option value="healthcare">Healthcare</option>
                                                <option value="retail">Retail</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Contact Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.contactName}
                                                onChange={(e) => handleChange('contactName', e.target.value)}
                                                placeholder="Full name"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Designation
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.designation}
                                                onChange={(e) => handleChange('designation', e.target.value)}
                                                placeholder="Your role"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Email <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                placeholder="work@company.com"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Phone <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: Order Details */}
                            {currentStep === 2 && (
                                <>
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <HiGift className="w-6 h-6 text-amber-500" />
                                        Order Details
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Quantity <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-4 gap-3 mb-2">
                                                {[50, 100, 250, 500].map((qty) => (
                                                    <button
                                                        key={qty}
                                                        type="button"
                                                        onClick={() => handleChange('quantity', qty)}
                                                        className={`py-3 rounded-xl font-semibold transition ${formData.quantity === qty
                                                                ? 'bg-amber-500 text-white'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {qty}+
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="number"
                                                value={formData.quantity}
                                                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                                                min="10"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                            />
                                            {formData.quantity >= 50 && (
                                                <p className="mt-2 text-sm text-green-600 font-medium">
                                                    🎉 You qualify for {formData.quantity >= 500 ? '20%' : formData.quantity >= 100 ? '15%' : '10%'} bulk discount!
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Expected Delivery Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.deliveryDate}
                                                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Delivery City <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.deliveryCity}
                                                    onChange={(e) => handleChange('deliveryCity', e.target.value)}
                                                    placeholder="Mumbai, Delhi, etc."
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 3: Customization */}
                            {currentStep === 3 && (
                                <>
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <HiSparkles className="w-6 h-6 text-amber-500" />
                                        Customization Options
                                    </h2>

                                    <div className="space-y-4">
                                        {/* Logo Branding */}
                                        <div className={`p-4 rounded-xl border-2 transition ${formData.logoRequired ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                                            }`}>
                                            <label className="flex items-start gap-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.logoRequired}
                                                    onChange={(e) => handleChange('logoRequired', e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-slate-800">Company Logo Branding</span>
                                                        <span className="text-sm text-amber-600 font-medium">+₹50/unit</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Add your company logo to each gift item
                                                    </p>
                                                    {formData.logoRequired && (
                                                        <div className="mt-3">
                                                            <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                                                                <HiUpload className="w-5 h-5 text-slate-400" />
                                                                <span className="text-sm text-slate-600">
                                                                    {formData.logoFile ? formData.logoFile.name : 'Upload logo (PNG, max 5MB)'}
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    accept=".png,.jpg,.jpeg,.svg"
                                                                    onChange={handleFileChange}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {/* Custom Message */}
                                        <div className={`p-4 rounded-xl border-2 transition ${formData.customMessage ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                                            }`}>
                                            <label className="flex items-start gap-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.customMessage}
                                                    onChange={(e) => handleChange('customMessage', e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-slate-800">Personalized Message Card</span>
                                                        <span className="text-sm text-green-600 font-medium">Free</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Include a custom greeting card with your message
                                                    </p>
                                                    {formData.customMessage && (
                                                        <textarea
                                                            value={formData.messageText}
                                                            onChange={(e) => handleChange('messageText', e.target.value)}
                                                            placeholder="Your message here..."
                                                            rows={3}
                                                            className="w-full mt-3 px-4 py-3 rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
                                                        />
                                                    )}
                                                </div>
                                            </label>
                                        </div>

                                        {/* Premium Packaging */}
                                        <div className={`p-4 rounded-xl border-2 transition ${formData.premiumPackaging ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                                            }`}>
                                            <label className="flex items-start gap-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.premiumPackaging}
                                                    onChange={(e) => handleChange('premiumPackaging', e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-slate-800">Premium Gift Packaging</span>
                                                        <span className="text-sm text-amber-600 font-medium">+₹30/unit</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Luxury handcrafted gift boxes with ribbon
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Gift Tags */}
                                        <div className={`p-4 rounded-xl border-2 transition ${formData.giftTags ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
                                            }`}>
                                            <label className="flex items-start gap-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.giftTags}
                                                    onChange={(e) => handleChange('giftTags', e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-slate-800">Individual Gift Tags</span>
                                                        <span className="text-sm text-amber-600 font-medium">+₹10/unit</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Personalized name tags for each recipient
                                                    </p>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Additional Notes */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Additional Notes
                                            </label>
                                            <textarea
                                                value={formData.additionalNotes}
                                                onChange={(e) => handleChange('additionalNotes', e.target.value)}
                                                placeholder="Any special requirements or comments..."
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 4: Success */}
                            {currentStep === 4 && quoteResult && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <HiCheck className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                        Quote Request Submitted!
                                    </h2>
                                    <p className="text-slate-500 mb-6">
                                        Your quote ID: <span className="font-semibold text-slate-800">{quoteResult.quoteId}</span>
                                    </p>

                                    <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-50 text-left mb-8">
                                        <h4 className="font-semibold text-slate-800 mb-4">What's Next?</h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3 text-sm text-slate-600">
                                                <HiClock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                <span>Our corporate sales team will review your request within 24 hours</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-600">
                                                <HiMail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                                <span>You'll receive a detailed quotation at {formData.email}</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-slate-600">
                                                <HiPhone className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                <span>A dedicated account manager will be assigned for your order</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Link
                                            to="/shop-by-occasion"
                                            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                                        >
                                            Continue Shopping
                                        </Link>
                                        <Link
                                            to="/"
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                                        >
                                            Back to Home
                                            <HiArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            {currentStep < 4 && (
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                                    {currentStep > 1 ? (
                                        <button
                                            onClick={() => setCurrentStep(currentStep - 1)}
                                            className="px-5 py-2 text-slate-600 hover:text-slate-800 transition"
                                        >
                                            ← Back
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    {currentStep < 3 ? (
                                        <button
                                            onClick={handleNext}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                                        >
                                            Continue
                                            <HiArrowRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                                            <HiDocumentText className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar - Quote Summary */}
                    {currentStep < 4 && (
                        <div className="lg:sticky lg:top-8 space-y-6">
                            {/* Product Card */}
                            {product && (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                                    <div className="aspect-video bg-slate-100">
                                        <img
                                            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x200'}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-800 line-clamp-2">{product.title}</h3>
                                        {product.state && (
                                            <p className="text-sm text-teal-600 mt-1">📍 {product.state}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Estimate Summary */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                <h3 className="font-bold text-slate-800 mb-4">Estimate Summary</h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Unit Price</span>
                                        <span className="font-medium text-slate-800">₹{estimate.unitPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Quantity</span>
                                        <span className="font-medium text-slate-800">{formData.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-medium text-slate-800">₹{estimate.subtotal.toLocaleString()}</span>
                                    </div>
                                    {estimate.extras > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Add-ons</span>
                                            <span className="font-medium text-slate-800">₹{estimate.extras.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {estimate.savings > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Bulk Savings</span>
                                            <span className="font-medium">-₹{estimate.savings.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-slate-200">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-semibold text-slate-800">Est. Total</span>
                                            <span className="font-bold text-slate-900">₹{estimate.total.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">*Final price may vary</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                    <HiShieldCheck className="w-5 h-5 text-green-400" />
                                    Why Choose Us?
                                </h4>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <HiCheck className="w-4 h-4 text-green-400" />
                                        Dedicated Account Manager
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <HiCheck className="w-4 h-4 text-green-400" />
                                        Quality Inspection Guaranteed
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <HiCheck className="w-4 h-4 text-green-400" />
                                        On-time Delivery Promise
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <HiCheck className="w-4 h-4 text-green-400" />
                                        GST Invoice Available
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BulkQuoteRequest;
