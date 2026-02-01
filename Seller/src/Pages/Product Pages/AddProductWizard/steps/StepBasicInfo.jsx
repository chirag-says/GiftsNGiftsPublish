import React from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { TextField, Select, MenuItem, FormControl } from '@mui/material';
import { MdDescription, MdTitle, MdStar, MdBusiness, MdInfo, MdAdd, MdDelete, MdLocationCity, MdCelebration, MdCheckCircle, MdFavorite } from 'react-icons/md';

// Indian States (focusing on Northeast and all India)
const INDIAN_STATES = [
    // Northeast States (Primary focus for GNG)
    'Tripura', 'Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Arunachal Pradesh', 'Sikkim',
    // Other States
    'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
    'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Occasions for product tagging (matches MongoDB schema)
const OCCASIONS = [
    'Diwali', 'Holi', 'Durga Puja', 'Bihu', 'Christmas', 'Eid',
    'Wedding', 'Anniversary', 'Birthday', 'Housewarming',
    'Corporate Gifting', 'Festive Season', 'Daily Use', 'Home Decor',
    'Puja', 'Traditional Ceremony', 'New Year', 'Employee Recognition',
    'Client Appreciation', 'Farewell', 'Baby Shower', 'Other'
];

// Relationship-based gifting (Gift For Whom)
const GIFT_FOR = [
    'Brother', 'Sister', 'Mother', 'Father', 'Wife', 'Husband',
    'Son', 'Daughter', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt',
    'Friend', 'Best Friend', 'Boyfriend', 'Girlfriend', 'Boss', 'Colleague',
    'Teacher', 'Kids', 'Teens', 'Men', 'Women', 'Couples', 'Parents',
    'In-Laws', 'Newlyweds', 'New Parents', 'Pet Lovers', 'Anyone'
];

function StepBasicInfo() {
    const { productData, updateProductData, errors } = useWizard();

    const handleChange = (field) => (e) => {
        updateProductData(field, e.target.value);
    };

    const characterLimits = {
        title: { min: 5, max: 100 },
        description: { min: 20, max: 2000 },
        highlights: { max: 1000 },
        brand: { max: 100 }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-4 shadow-lg shadow-orange-500/25">
                    <MdDescription size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Basic Product Information</h2>
                <p className="text-gray-500 mt-2 text-sm">Provide essential details about your product</p>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100">
                    {productData.categoryName}
                </span>
                <span className="text-gray-400">→</span>
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium border border-purple-100">
                    {productData.subcategoryName}
                </span>
            </div>

            {/* Form Fields */}
            <div className="max-w-3xl mx-auto space-y-5">
                {/* Product Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                            <MdTitle className="text-orange-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Product Title <span className="text-red-500">*</span></h3>
                            <p className="text-xs text-gray-500">A clear, descriptive title for your product</p>
                        </div>
                    </div>

                    <TextField
                        fullWidth
                        size="small"
                        value={productData.title}
                        onChange={handleChange('title')}
                        placeholder="e.g., Handcrafted Ceramic Tea Set - Traditional Tripuri Design"
                        error={!!errors.title}
                        helperText={errors.title || `${productData.title.length}/${characterLimits.title.max} characters (min ${characterLimits.title.min})`}
                        inputProps={{ maxLength: characterLimits.title.max }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: '#f9fafb',
                            }
                        }}
                    />

                    <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <MdInfo className="flex-shrink-0 mt-0.5 text-gray-400" size={14} />
                        <p>
                            <span className="font-medium">Tip:</span> Include key details like material, size, or unique features in your title for better visibility
                        </p>
                    </div>
                </motion.div>

                {/* Product Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <MdDescription className="text-blue-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Product Description <span className="text-red-500">*</span></h3>
                            <p className="text-xs text-gray-500">Detailed description of your product</p>
                        </div>
                    </div>

                    <TextField
                        fullWidth
                        multiline
                        rows={5}
                        value={productData.description}
                        onChange={handleChange('description')}
                        placeholder="Describe your product in detail. Include information about materials, craftsmanship, dimensions, care instructions, and what makes it special..."
                        error={!!errors.description}
                        helperText={errors.description || `${productData.description.length}/${characterLimits.description.max} characters (min ${characterLimits.description.min})`}
                        inputProps={{ maxLength: characterLimits.description.max }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: '#f9fafb',
                            }
                        }}
                    />
                </motion.div>

                {/* Key Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <MdStar className="text-emerald-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Key Highlights</h3>
                            <p className="text-xs text-gray-500">Bullet points highlighting product features</p>
                        </div>
                    </div>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={productData.highlights}
                        onChange={handleChange('highlights')}
                        placeholder="• 100% handcrafted by local artisans&#10;• Made from natural materials&#10;• Eco-friendly and sustainable&#10;• Perfect for gifting"
                        helperText={`${productData.highlights.length}/${characterLimits.highlights.max} characters`}
                        inputProps={{ maxLength: characterLimits.highlights.max }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: '#f9fafb',
                            }
                        }}
                    />

                    <div className="mt-3 flex gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => updateProductData('highlights', productData.highlights + (productData.highlights ? '\n' : '') + '• ')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                        >
                            <MdAdd size={14} /> Add Bullet
                        </button>
                        <button
                            type="button"
                            onClick={() => updateProductData('highlights', '')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                        >
                            <MdDelete size={14} /> Clear
                        </button>
                    </div>
                </motion.div>

                {/* Brand Name */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MdBusiness className="text-purple-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Brand / Artisan Name</h3>
                            <p className="text-xs text-gray-500">If applicable, enter the brand or artisan name</p>
                        </div>
                    </div>

                    <TextField
                        fullWidth
                        size="small"
                        value={productData.brand}
                        onChange={handleChange('brand')}
                        placeholder="e.g., Tribal Creations, Tripura Handicrafts"
                        helperText={`${productData.brand.length}/${characterLimits.brand.max} characters`}
                        inputProps={{ maxLength: characterLimits.brand.max }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                backgroundColor: '#f9fafb',
                            }
                        }}
                    />
                </motion.div>

                {/* Origin State */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                            <MdLocationCity className="text-teal-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Origin State</h3>
                            <p className="text-xs text-gray-500">Select the state where this product is crafted (if applicable)</p>
                        </div>
                    </div>

                    <FormControl fullWidth size="small">
                        <Select
                            value={productData.state}
                            onChange={(e) => updateProductData('state', e.target.value)}
                            displayEmpty
                            sx={{
                                borderRadius: '10px',
                                backgroundColor: '#f9fafb',
                            }}
                        >
                            <MenuItem value="">
                                <em>Select State (Optional)</em>
                            </MenuItem>
                            {INDIAN_STATES.map((state) => (
                                <MenuItem key={state} value={state}>
                                    {state}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <MdInfo className="flex-shrink-0 mt-0.5 text-gray-400" size={14} />
                        <p>
                            <span className="font-medium">Why this matters:</span> Highlighting regional origin helps customers discover authentic local handicrafts
                        </p>
                    </div>
                </motion.div>

                {/* Occasions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center">
                            <MdCelebration className="text-pink-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Suitable Occasions</h3>
                            <p className="text-xs text-gray-500">Select occasions where this product is perfect (if applicable)</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {OCCASIONS.map((occasion) => {
                            const isSelected = productData.occasions?.includes(occasion);
                            return (
                                <button
                                    key={occasion}
                                    type="button"
                                    onClick={() => {
                                        const current = productData.occasions || [];
                                        if (isSelected) {
                                            updateProductData('occasions', current.filter(o => o !== occasion));
                                        } else {
                                            updateProductData('occasions', [...current, occasion]);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${isSelected
                                        ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                                        }`}
                                >
                                    {occasion}
                                </button>
                            );
                        })}
                    </div>

                    {productData.occasions?.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-pink-600">
                            <MdCheckCircle size={16} />
                            <span>{productData.occasions.length} occasion(s) selected</span>
                        </div>
                    )}
                </motion.div>

                {/* Gift For (Relationship-based) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                            <MdFavorite className="text-red-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Gift For</h3>
                            <p className="text-xs text-gray-500">Select who this gift is perfect for (by relationship)</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {GIFT_FOR.map((relation) => {
                            const isSelected = productData.giftFor?.includes(relation);
                            return (
                                <button
                                    key={relation}
                                    type="button"
                                    onClick={() => {
                                        const current = productData.giftFor || [];
                                        if (isSelected) {
                                            updateProductData('giftFor', current.filter(r => r !== relation));
                                        } else {
                                            updateProductData('giftFor', [...current, relation]);
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${isSelected
                                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50'
                                        }`}
                                >
                                    {relation}
                                </button>
                            );
                        })}
                    </div>

                    {productData.giftFor?.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                            <MdCheckCircle size={16} />
                            <span>{productData.giftFor.length} relationship(s) selected</span>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Preview Card */}
            {productData.title && productData.description && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200"
                >
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Preview</h4>
                    <div className="flex gap-5">
                        <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <MdDescription className="text-gray-400" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                    {productData.categoryName}
                                </span>
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                    {productData.subcategoryName}
                                </span>
                                {productData.state && (
                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded font-medium">
                                        📍 {productData.state}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-gray-800 mb-1 truncate">{productData.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{productData.description}</p>
                            {productData.brand && (
                                <p className="text-xs text-gray-500 mt-2">by {productData.brand}</p>
                            )}
                            {productData.occasions?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {productData.occasions.slice(0, 3).map(occ => (
                                        <span key={occ} className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded">
                                            {occ}
                                        </span>
                                    ))}
                                    {productData.occasions.length > 3 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                            +{productData.occasions.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                            {productData.giftFor?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {productData.giftFor.slice(0, 3).map(rel => (
                                        <span key={rel} className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                                            For {rel}
                                        </span>
                                    ))}
                                    {productData.giftFor.length > 3 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                            +{productData.giftFor.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default StepBasicInfo;
