import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { TextField, Select, MenuItem, FormControl, Chip, Box, OutlinedInput, Checkbox, ListItemText } from '@mui/material';
import { MdDescription, MdTitle, MdStar, MdBusiness, MdInfo, MdAdd, MdDelete, MdLocationCity, MdCelebration, MdCheckCircle, MdFavorite, MdClose, MdExpandMore, MdSearch } from 'react-icons/md';
import api from '../../../../utils/api';

// Custom Multi-Select Dropdown Component
function MultiSelectDropdown({
    label,
    icon: Icon,
    iconColor,
    iconBg,
    selectedItems,
    groups,
    allItems,
    onChange,
    placeholder,
    chipColor
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (item) => {
        if (selectedItems.includes(item)) {
            onChange(selectedItems.filter(i => i !== item));
        } else {
            onChange([...selectedItems, item]);
        }
    };

    const removeItem = (item) => {
        onChange(selectedItems.filter(i => i !== item));
    };

    const clearAll = () => {
        onChange([]);
    };

    const filteredGroups = {};
    Object.entries(groups).forEach(([group, items]) => {
        const filtered = items.filter(item =>
            item.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
            filteredGroups[group] = filtered;
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon className={iconColor} size={18} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{label}</h3>
                    <p className="text-xs text-gray-500">{placeholder}</p>
                </div>
                {selectedItems.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Selected Items Display */}
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    {selectedItems.map((item) => (
                        <motion.span
                            key={item}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 ${chipColor} rounded-lg text-sm font-medium`}
                        >
                            {item}
                            <button
                                type="button"
                                onClick={() => removeItem(item)}
                                className="ml-1 hover:opacity-70"
                            >
                                <MdClose size={14} />
                            </button>
                        </motion.span>
                    ))}
                </div>
            )}

            {/* Dropdown Toggle */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${isOpen
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
            >
                <span className={`text-sm ${selectedItems.length > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                    {selectedItems.length > 0
                        ? `${selectedItems.length} selected`
                        : `Click to select ${label.toLowerCase()}`}
                </span>
                <MdExpandMore
                    size={24}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 border border-gray-200 rounded-xl bg-white shadow-lg max-h-80 overflow-hidden">
                            {/* Search */}
                            <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                                <div className="relative">
                                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Groups */}
                            <div className="overflow-y-auto max-h-60 p-2">
                                {Object.entries(filteredGroups).map(([group, items]) => (
                                    <div key={group} className="mb-3">
                                        <div className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            {group}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 px-1">
                                            {items.map((item) => {
                                                const isSelected = selectedItems.includes(item);
                                                return (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => toggleItem(item)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isSelected
                                                            ? `${chipColor} border-transparent shadow-sm`
                                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {isSelected && <MdCheckCircle className="inline mr-1" size={12} />}
                                                        {item}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {Object.keys(filteredGroups).length === 0 && (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        No options found
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Count Badge */}
            {selectedItems.length > 0 && !isOpen && (
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
                    <MdCheckCircle size={16} />
                    <span>{selectedItems.length} {label.toLowerCase()} selected</span>
                </div>
            )}
        </motion.div>
    );
}

function StepBasicInfo() {
    const { productData, updateProductData, errors } = useWizard();

    // Dynamic Data States
    const [occasionGroups, setOccasionGroups] = useState({});
    const [allOccasions, setAllOccasions] = useState([]);
    const [giftForGroups, setGiftForGroups] = useState({});
    const [allGiftFor, setAllGiftFor] = useState([]);
    const [statesList, setStatesList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch dynamic data
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [occRes, giftRes, stateRes] = await Promise.all([
                    api.get('/api/occasions'),
                    api.get('/api/gift-for'),
                    api.get('/api/states')
                ]);

                // Process Occasions
                if (occRes.data.success && occRes.data.data) {
                    const groups = {};
                    Object.entries(occRes.data.data).forEach(([key, items]) => {
                        const groupName = key.charAt(0).toUpperCase() + key.slice(1);
                        groups[groupName] = items.map(i => i.name);
                    });
                    setOccasionGroups(groups);
                    setAllOccasions(Object.values(groups).flat());
                }

                // Process GiftFor
                if (giftRes.data.success && giftRes.data.data) {
                    const groups = {};
                    Object.entries(giftRes.data.data).forEach(([key, items]) => {
                        const groupName = key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        groups[groupName] = items.map(i => i.name);
                    });
                    setGiftForGroups(groups);
                    setAllGiftFor(Object.values(groups).flat());
                }

                // Process States
                if (stateRes.data.success && Array.isArray(stateRes.data.data)) {
                    setStatesList(stateRes.data.data.map(s => s.name));
                }
            } catch (error) {
                console.error('Error fetching form options:', error);
                // Fallback to minimal defaults if fetch fails
                setStatesList(['Assam', 'Tripura', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Arunachal Pradesh', 'Sikkim']);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

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
                            disabled={loading || statesList.length === 0}
                            sx={{
                                borderRadius: '10px',
                                backgroundColor: '#f9fafb',
                            }}
                        >
                            <MenuItem value="">
                                <em>{loading ? 'Loading states...' : 'Select State (Optional)'}</em>
                            </MenuItem>
                            {statesList.map((state) => (
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

                {/* Occasions - Multi-Select Dropdown */}
                <MultiSelectDropdown
                    label="Suitable Occasions"
                    icon={MdCelebration}
                    iconColor="text-pink-600"
                    iconBg="bg-pink-100"
                    selectedItems={productData.occasions || []}
                    groups={occasionGroups}
                    allItems={allOccasions}
                    onChange={(items) => updateProductData('occasions', items)}
                    placeholder={loading ? "Loading occasions..." : "Select occasions when this product is perfect"}
                    chipColor="bg-pink-500 text-white"
                />

                {/* Gift For - Multi-Select Dropdown */}
                <MultiSelectDropdown
                    label="Gift For"
                    icon={MdFavorite}
                    iconColor="text-red-600"
                    iconBg="bg-red-100"
                    selectedItems={productData.giftFor || []}
                    groups={giftForGroups}
                    allItems={allGiftFor}
                    onChange={(items) => updateProductData('giftFor', items)}
                    placeholder={loading ? "Loading relations..." : "Select who this gift is perfect for (by relationship)"}
                    chipColor="bg-red-500 text-white"
                />
            </div>

            {/* Preview Card */}
            {productData.title && productData.description && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto mt-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
                >
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">📦 Product Preview</h4>
                    <div className="flex gap-5">
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
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
                                            🎉 {occ}
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
                                            ❤️ For {rel}
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
