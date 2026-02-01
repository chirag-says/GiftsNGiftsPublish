import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import StepCategory from './steps/StepCategory';
import StepSubcategory from './steps/StepSubcategory';
import StepBasicInfo from './steps/StepBasicInfo';
import StepCategoryDetails from './steps/StepCategoryDetails';
import StepPricing from './steps/StepPricing';
import StepB2B from './steps/StepB2B';
import StepImages from './steps/StepImages';
import StepShipping from './steps/StepShipping';
import StepReview from './steps/StepReview';
import { getAttributesForCategory } from '../../../config/categoryAttributes';
import {
    MdCategory,
    MdSubdirectoryArrowRight,
    MdDescription,
    MdTune,
    MdAttachMoney,
    MdBusinessCenter,
    MdPhotoLibrary,
    MdLocalShipping,
    MdCheckCircle,
    MdArrowBack,
    MdArrowForward,
    MdRocketLaunch,
    MdHourglassTop,
    MdError
} from 'react-icons/md';

// Create context for wizard state
export const WizardContext = createContext();

export const useWizard = () => useContext(WizardContext);

const STEPS = [
    { id: 1, title: 'Category', shortTitle: 'Category', icon: MdCategory, description: 'Select product category' },
    { id: 2, title: 'Subcategory', shortTitle: 'Subcategory', icon: MdSubdirectoryArrowRight, description: 'Choose subcategory' },
    { id: 3, title: 'Basic Info', shortTitle: 'Basic', icon: MdDescription, description: 'Product details' },
    { id: 4, title: 'Category Details', shortTitle: 'Details', icon: MdTune, description: 'Category-specific info' },
    { id: 5, title: 'Pricing', shortTitle: 'Pricing', icon: MdAttachMoney, description: 'Set price & stock' },
    { id: 6, title: 'B2B Options', shortTitle: 'B2B', icon: MdBusinessCenter, description: 'Corporate gifting options' },
    { id: 7, title: 'Images', shortTitle: 'Images', icon: MdPhotoLibrary, description: 'Upload product photos' },
    { id: 8, title: 'Shipping', shortTitle: 'Shipping', icon: MdLocalShipping, description: 'Shipping & compliance' },
    { id: 9, title: 'Review', shortTitle: 'Review', icon: MdCheckCircle, description: 'Review & publish' },
];

const initialProductData = {
    // Category Info
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',

    // Basic Info
    title: '',
    description: '',
    highlights: '',
    brand: '',

    // State & Occasion (for regional handicrafts)
    state: '',
    occasions: [],
    giftFor: [],  // Relationship-based gifting (Brother, Sister, Mother, etc.)

    // Pricing
    oldprice: '',
    sellingPrice: '',
    discount: '',
    stock: '',
    moq: 1,
    hsnCode: '',
    gstRate: 18,

    // B2B Corporate Gifting Fields
    bulkPricing: {
        tier25: '',
        tier50: '',
        tier100: '',
        tier500: ''
    },
    customizationAvailable: {
        logo: false,
        message: true,
        packaging: true
    },
    logoMinQuantity: 25,
    recipientTypes: [],
    perfectFor: [],
    contents: [],
    productType: 'Single Item',
    deliveryDays: '5-7 days',
    tags: [],

    // Dynamic Category-specific attributes
    dynamicAttributes: {},

    // Shipping & Compliance
    countryOfOrigin: 'India',
    manufacturer: '',
    packer: '',
    productDimensions: '',
    itemWeight: '',

    // Importer Details
    isImported: false,
    importerName: '',
    importerAddress: '',

    // Compliance
    isBrandedProduct: false,
    fssaiRequired: false,
    fssaiLicenseNumber: '',
    bisRequired: false,
    bisCertificateNumber: '',
    drugLicenseRequired: false,
    drugLicenseNumber: '',

    // Images
    images: [],
};

function AddProductWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [productData, setProductData] = useState(initialProductData);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [categoryConfig, setCategoryConfig] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [approved, setApproved] = useState(false);
    const [sellerLoading, setSellerLoading] = useState(true);
    const [completedSteps, setCompletedSteps] = useState([]);

    // Fetch initial data
    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
        fetchSeller();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/getcategories');
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategories = async () => {
        try {
            const response = await api.get('/api/getsubcategories');
            setSubcategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchSeller = async () => {
        try {
            const res = await api.get('/api/seller/sellerdetails');
            if (res.data.success && Array.isArray(res.data.seller) && res.data.seller.length) {
                setApproved(res.data.seller[0].approved);
            }
        } catch (error) {
            console.error('Error fetching seller:', error);
        } finally {
            setSellerLoading(false);
        }
    };

    // Update category config when category changes
    useEffect(() => {
        if (productData.categoryName) {
            const config = getAttributesForCategory(productData.categoryName);
            setCategoryConfig(config);
        } else {
            setCategoryConfig(null);
        }
    }, [productData.categoryName]);

    // Filter subcategories based on selected category
    const filteredSubcategories = useMemo(() => {
        if (!productData.categoryId) return [];
        return subcategories.filter(sub => sub.category?._id === productData.categoryId);
    }, [productData.categoryId, subcategories]);

    // Calculate form progress
    const formProgress = useMemo(() => {
        let totalFields = 0;
        let filledFields = 0;

        // Required core fields
        const coreFields = ['categoryId', 'subcategoryId', 'title', 'description', 'oldprice', 'sellingPrice', 'stock'];
        totalFields += coreFields.length + 1; // +1 for images

        coreFields.forEach(field => {
            if (String(productData[field] || '').trim()) filledFields++;
        });

        if (productData.images.length > 0) filledFields++;

        // Dynamic required fields
        if (categoryConfig?.fields) {
            const requiredFields = categoryConfig.fields.filter(f => f.required);
            totalFields += requiredFields.length;
            requiredFields.forEach(field => {
                if (String(productData.dynamicAttributes[field.name] || '').trim()) filledFields++;
            });
        }

        return Math.round((filledFields / totalFields) * 100);
    }, [productData, categoryConfig]);

    // Update product data
    const updateProductData = (field, value) => {
        setProductData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // Update dynamic attributes
    const updateDynamicAttribute = (fieldName, value) => {
        setProductData(prev => ({
            ...prev,
            dynamicAttributes: { ...prev.dynamicAttributes, [fieldName]: value }
        }));
    };

    // Validate current step
    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!productData.categoryId) newErrors.categoryId = 'Please select a category';
                break;
            case 2:
                if (!productData.subcategoryId) newErrors.subcategoryId = 'Please select a subcategory';
                break;
            case 3:
                if (!productData.title.trim()) newErrors.title = 'Product title is required';
                else if (productData.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';
                if (!productData.description.trim()) newErrors.description = 'Description is required';
                else if (productData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
                break;
            case 4:
                if (categoryConfig?.fields) {
                    categoryConfig.fields.filter(f => f.required).forEach(field => {
                        if (!String(productData.dynamicAttributes[field.name] || '').trim()) {
                            newErrors[field.name] = `${field.label} is required`;
                        }
                    });
                }
                break;
            case 5:
                if (!productData.oldprice) newErrors.oldprice = 'MRP is required';
                if (!productData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
                else if (Number(productData.sellingPrice) > Number(productData.oldprice)) {
                    newErrors.sellingPrice = 'Selling price cannot exceed MRP';
                }
                if (!productData.stock) newErrors.stock = 'Stock is required';
                else if (Number(productData.stock) <= 0) newErrors.stock = 'Stock must be at least 1';
                break;
            case 6:
                // B2B Options - all fields are optional, no validation required
                break;
            case 7:
                // Images validation
                if (productData.images.length === 0) newErrors.images = 'Upload at least one product image';
                break;
            case 8:
                // Shipping validations (optional mostly)
                if (productData.isImported) {
                    if (!productData.importerName.trim()) newErrors.importerName = 'Importer name is required for imported products';
                    if (!productData.importerAddress.trim()) newErrors.importerAddress = 'Importer address is required';
                }
                if (productData.fssaiRequired && !productData.fssaiLicenseNumber.trim()) {
                    newErrors.fssaiLicenseNumber = 'FSSAI license number is required';
                }
                if (productData.bisRequired && !productData.bisCertificateNumber.trim()) {
                    newErrors.bisCertificateNumber = 'BIS certificate number is required';
                }
                if (productData.drugLicenseRequired && !productData.drugLicenseNumber.trim()) {
                    newErrors.drugLicenseNumber = 'Drug license number is required';
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Navigate to next step
    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
            if (currentStep < STEPS.length) {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    // Navigate to previous step
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Go to specific step
    const goToStep = (step) => {
        // Allow going back to any completed step or the next available step
        if (step <= Math.max(...completedSteps, 0) + 1) {
            setCurrentStep(step);
        }
    };

    // Submit product
    const submitProduct = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);
        setSubmitMessage({ type: '', message: '' });

        try {
            const formData = new FormData();

            // Core fields
            formData.append('title', productData.title);
            formData.append('description', productData.description);
            formData.append('categoryname', productData.categoryId);
            formData.append('subcategory', productData.subcategoryId);
            formData.append('oldprice', productData.oldprice);
            formData.append('price', productData.sellingPrice);
            formData.append('sellingPrice', productData.sellingPrice);
            formData.append('discount', productData.discount || 0);
            formData.append('stock', productData.stock);

            // Optional fields
            if (productData.highlights) formData.append('aboutThisItem', productData.highlights);
            if (productData.brand) formData.append('brand', productData.brand);
            if (productData.moq) formData.append('moq', productData.moq);
            if (productData.hsnCode) formData.append('hsnCode', productData.hsnCode);
            if (productData.gstRate) formData.append('gstRate', productData.gstRate);
            if (productData.countryOfOrigin) formData.append('countryOfOrigin', productData.countryOfOrigin);
            if (productData.manufacturer) formData.append('manufacturer', productData.manufacturer);
            if (productData.packer) formData.append('packer', productData.packer);
            if (productData.productDimensions) formData.append('productDimensions', productData.productDimensions);
            if (productData.itemWeight) formData.append('itemWeight', productData.itemWeight);

            // State & Occasion fields
            if (productData.state) formData.append('state', productData.state);
            if (productData.occasions && productData.occasions.length > 0) {
                formData.append('occasions', JSON.stringify(productData.occasions));
            }
            if (productData.giftFor && productData.giftFor.length > 0) {
                formData.append('giftFor', JSON.stringify(productData.giftFor));
            }

            // B2B Corporate Gifting fields
            if (productData.bulkPricing) {
                formData.append('bulkPricing', JSON.stringify(productData.bulkPricing));
            }
            if (productData.customizationAvailable) {
                formData.append('customizationAvailable', JSON.stringify(productData.customizationAvailable));
            }
            if (productData.logoMinQuantity) formData.append('logoMinQuantity', productData.logoMinQuantity);
            if (productData.recipientTypes && productData.recipientTypes.length > 0) {
                formData.append('recipientTypes', JSON.stringify(productData.recipientTypes));
            }
            if (productData.perfectFor && productData.perfectFor.length > 0) {
                formData.append('perfectFor', JSON.stringify(productData.perfectFor));
            }
            if (productData.contents && productData.contents.length > 0) {
                formData.append('contents', JSON.stringify(productData.contents));
            }
            if (productData.productType) formData.append('productType', productData.productType);
            if (productData.deliveryDays) formData.append('deliveryDays', productData.deliveryDays);
            if (productData.tags && productData.tags.length > 0) {
                formData.append('tags', JSON.stringify(productData.tags));
            }

            // Importer details
            formData.append('isImported', productData.isImported);
            if (productData.isImported) {
                formData.append('importerName', productData.importerName);
                formData.append('importerAddress', productData.importerAddress);
            }

            // Compliance
            formData.append('isBrandedProduct', productData.isBrandedProduct);
            formData.append('fssaiRequired', productData.fssaiRequired);
            if (productData.fssaiLicenseNumber) formData.append('fssaiLicenseNumber', productData.fssaiLicenseNumber);
            formData.append('bisRequired', productData.bisRequired);
            if (productData.bisCertificateNumber) formData.append('bisCertificateNumber', productData.bisCertificateNumber);
            formData.append('drugLicenseRequired', productData.drugLicenseRequired);
            if (productData.drugLicenseNumber) formData.append('drugLicenseNumber', productData.drugLicenseNumber);

            // Dynamic attributes - Send as both additional_details AND attributes for backend
            if (Object.keys(productData.dynamicAttributes).length > 0) {
                formData.append('attributes', JSON.stringify(productData.dynamicAttributes));
                formData.append('additional_details', JSON.stringify(productData.dynamicAttributes));

                // Also add common fields for backend compatibility
                if (productData.dynamicAttributes.material) formData.append('materialComposition', productData.dynamicAttributes.material);
                if (productData.dynamicAttributes.weight) formData.append('itemWeight', productData.dynamicAttributes.weight);
                if (productData.dynamicAttributes.dimensions) formData.append('productDimensions', productData.dynamicAttributes.dimensions);
                if (productData.dynamicAttributes.care_instructions) formData.append('careInstructions', productData.dynamicAttributes.care_instructions);
                if (productData.dynamicAttributes.ingredients) formData.append('ingredients', productData.dynamicAttributes.ingredients);
                if (productData.dynamicAttributes.allergens) formData.append('allergens', productData.dynamicAttributes.allergens);
            }

            // Images
            productData.images.forEach(img => formData.append('images', img));

            const response = await api.post('/api/seller/addproducts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setSubmitMessage({ type: 'success', message: 'Product added successfully!' });
                // Reset form after success
                setTimeout(() => {
                    setProductData(initialProductData);
                    setCurrentStep(1);
                    setCompletedSteps([]);
                    setSubmitMessage({ type: '', message: '' });
                }, 3000);
            } else {
                setSubmitMessage({ type: 'error', message: response.data.message || 'Failed to add product' });
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', message: error.response?.data?.message || 'Failed to add product' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Context value
    const wizardValue = {
        currentStep,
        productData,
        categories,
        subcategories: filteredSubcategories,
        categoryConfig,
        errors,
        updateProductData,
        updateDynamicAttribute,
        fetchCategories,
        fetchSubcategories,
    };

    // Loading state
    if (sellerLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="bg-white p-10 rounded-3xl shadow-2xl text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Not approved state
    if (!approved) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-amber-200 text-amber-900 text-center p-10 rounded-2xl shadow-xl max-w-lg"
                >
                    <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <MdHourglassTop className="text-amber-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Pending Approval</h2>
                    <p className="text-gray-600">Your seller account is pending approval. You'll be able to add products once your account is verified.</p>
                </motion.div>
            </div>
        );
    }

    // Get current step component
    const renderStep = () => {
        switch (currentStep) {
            case 1: return <StepCategory />;
            case 2: return <StepSubcategory />;
            case 3: return <StepBasicInfo />;
            case 4: return <StepCategoryDetails />;
            case 5: return <StepPricing />;
            case 6: return <StepB2B />;
            case 7: return <StepImages />;
            case 8: return <StepShipping />;
            case 9: return <StepReview />;
            default: return <StepCategory />;
        }
    };

    return (
        <WizardContext.Provider value={wizardValue}>
            <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-6 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                                    Add New Product
                                </h1>
                                <p className="text-gray-500 mt-2">Complete all steps to list your product on the marketplace</p>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-lg border border-gray-100">
                                <div className="relative w-14 h-14">
                                    <svg className="w-14 h-14 transform -rotate-90">
                                        <circle cx="28" cy="28" r="24" stroke="#e5e7eb" strokeWidth="5" fill="none" />
                                        <circle
                                            cx="28" cy="28" r="24"
                                            stroke={formProgress >= 80 ? '#10b981' : formProgress >= 50 ? '#3b82f6' : '#8b5cf6'}
                                            strokeWidth="5"
                                            fill="none"
                                            strokeDasharray={`${(formProgress / 100) * 151} 151`}
                                            strokeLinecap="round"
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                                        {formProgress}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {formProgress < 50 ? 'Getting Started' : formProgress < 80 ? 'Almost There' : 'Ready to Publish'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8 overflow-x-auto pb-2 scrollbar-hide"
                    >
                        <div className="flex items-center justify-between min-w-max lg:min-w-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-3 lg:p-4 border border-white/50">
                            {STEPS.map((step, index) => {
                                const StepIcon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = completedSteps.includes(step.id);
                                const isClickable = step.id <= Math.max(...completedSteps, 0) + 1;

                                return (
                                    <React.Fragment key={step.id}>
                                        <motion.button
                                            whileHover={isClickable ? { scale: 1.05 } : {}}
                                            whileTap={isClickable ? { scale: 0.95 } : {}}
                                            onClick={() => isClickable && goToStep(step.id)}
                                            disabled={!isClickable}
                                            className={`relative flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-2.5 lg:py-3 rounded-xl transition-all duration-300 ${isActive
                                                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                                                : isCompleted
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-md'
                                                    : isClickable
                                                        ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-md'
                                                        : 'bg-gray-50/50 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isActive
                                                ? 'bg-white/25'
                                                : isCompleted
                                                    ? 'bg-emerald-200'
                                                    : 'bg-gray-200'
                                                }`}>
                                                {isCompleted && !isActive ? (
                                                    <MdCheckCircle className="text-emerald-600" size={20} />
                                                ) : (
                                                    <StepIcon size={20} />
                                                )}
                                            </div>
                                            <span className="hidden lg:block text-sm font-semibold whitespace-nowrap">{step.title}</span>
                                            <span className="lg:hidden text-xs font-semibold whitespace-nowrap">{step.shortTitle}</span>

                                            {/* Active indicator glow */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeStep"
                                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-lg -z-10"
                                                />
                                            )}
                                        </motion.button>
                                        {index < STEPS.length - 1 && (
                                            <div className={`hidden lg:flex items-center mx-1`}>
                                                <div className={`w-6 h-1 rounded-full transition-all duration-500 ${completedSteps.includes(step.id)
                                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                        : 'bg-gray-200'
                                                    }`} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Current Step Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 text-center"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-100">
                            <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {currentStep}
                            </span>
                            <span className="text-gray-600 font-medium">{STEPS[currentStep - 1]?.description}</span>
                        </span>
                    </motion.div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 lg:p-8">
                                {renderStep()}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Submit Message */}
                    <AnimatePresence>
                        {submitMessage.message && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${submitMessage.type === 'success'
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                                    }`}
                            >
                                {submitMessage.type === 'success' ? (
                                    <MdCheckCircle size={24} />
                                ) : (
                                    <MdError size={24} />
                                )}
                                <span className="font-medium">{submitMessage.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 flex flex-col sm:flex-row justify-between gap-4"
                    >
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${currentStep === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            <MdArrowBack size={20} />
                            <span>Previous Step</span>
                        </button>

                        {currentStep < STEPS.length ? (
                            <button
                                onClick={nextStep}
                                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                            >
                                <span>Continue</span>
                                <MdArrowForward size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={submitProduct}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdRocketLaunch size={20} />
                                        <span>Publish Product</span>
                                    </>
                                )}
                            </button>
                        )}
                    </motion.div>
                </div>
            </section>
        </WizardContext.Provider>
    );
}

export default AddProductWizard;
