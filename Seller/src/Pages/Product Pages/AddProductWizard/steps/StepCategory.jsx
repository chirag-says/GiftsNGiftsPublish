import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import {
    MdCategory,
    MdSearch,
    MdCheck,
    MdAdd,
    MdLocalCafe,
    MdNature,
    MdCake,
    MdCheckroom,
    MdDiamond,
    MdDevices,
    MdHome,
    MdMenuBook,
    MdInventory2,
    MdForest,
    MdSpa,
    MdCardGiftcard,
    MdAutoAwesome
} from 'react-icons/md';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCategory from '../../../Category/AddCategory';

// Professional category icons with gradient colors
const getCategoryDetails = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';

    if (name.includes('tea') || name.includes('teaware'))
        return { icon: MdLocalCafe, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (name.includes('bamboo') || name.includes('cane'))
        return { icon: MdForest, gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50', border: 'border-green-200' };
    if (name.includes('cake') || name.includes('bakery') || name.includes('food'))
        return { icon: MdCake, gradient: 'from-pink-400 to-rose-500', bg: 'bg-pink-50', border: 'border-pink-200' };
    if (name.includes('handloom') || name.includes('textile') || name.includes('fabric'))
        return { icon: MdCheckroom, gradient: 'from-purple-400 to-violet-500', bg: 'bg-purple-50', border: 'border-purple-200' };
    if (name.includes('shawl') || name.includes('stole'))
        return { icon: MdSpa, gradient: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', border: 'border-teal-200' };
    if (name.includes('jewel') || name.includes('ornament') || name.includes('traditional jewelry'))
        return { icon: MdDiamond, gradient: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (name.includes('women') || name.includes('wear') || name.includes('cloth'))
        return { icon: MdCheckroom, gradient: 'from-fuchsia-400 to-pink-500', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200' };
    if (name.includes('electronic'))
        return { icon: MdDevices, gradient: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (name.includes('home') || name.includes('kitchen') || name.includes('decor'))
        return { icon: MdHome, gradient: 'from-orange-400 to-red-500', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (name.includes('book'))
        return { icon: MdMenuBook, gradient: 'from-slate-400 to-gray-500', bg: 'bg-slate-50', border: 'border-slate-200' };
    if (name.includes('gift'))
        return { icon: MdCardGiftcard, gradient: 'from-rose-400 to-red-500', bg: 'bg-rose-50', border: 'border-rose-200' };

    return { icon: MdInventory2, gradient: 'from-blue-400 to-purple-500', bg: 'bg-blue-50', border: 'border-blue-200' };
};

function StepCategory() {
    const { productData, categories, updateProductData, errors, fetchCategories } = useWizard();
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);

    const filteredCategories = categories.filter(cat =>
        cat.categoryname?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCategorySelect = (category) => {
        updateProductData('categoryId', category._id);
        updateProductData('categoryName', category.categoryname);
        updateProductData('subcategoryId', '');
        updateProductData('subcategoryName', '');
        updateProductData('dynamicAttributes', {});
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white mb-5 shadow-xl shadow-purple-500/30"
                >
                    <MdCategory size={32} />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl lg:text-3xl font-bold text-gray-900"
                >
                    Select Product Category
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 mt-2 text-sm max-w-md mx-auto"
                >
                    Choose the category that best describes your product to help buyers find it easily
                </motion.p>
            </div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto"
            >
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20 group-focus-within:opacity-40 transition-opacity" />
                    <div className="relative">
                        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-base bg-white font-medium placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Error Message */}
            {errors.categoryId && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200 shadow-sm">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        {errors.categoryId}
                    </span>
                </motion.div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                {filteredCategories.map((category, index) => {
                    const isSelected = productData.categoryId === category._id;
                    const categoryDetails = getCategoryDetails(category.categoryname);
                    const IconComponent = categoryDetails.icon;
                    const hasImage = category.images && category.images[0]?.url;

                    return (
                        <motion.button
                            key={category._id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.04, type: "spring", stiffness: 200 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCategorySelect(category)}
                            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left group ${isSelected
                                    ? `border-blue-500 ${categoryDetails.bg} shadow-xl shadow-blue-500/20`
                                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg'
                                }`}
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="absolute top-3 right-3 z-20 w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <MdCheck className="text-white" size={16} />
                                </motion.div>
                            )}

                            {/* Inner Content */}
                            <div className="p-5">
                                {/* Category Icon */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${isSelected
                                        ? `bg-gradient-to-br ${categoryDetails.gradient} text-white shadow-lg`
                                        : `${categoryDetails.bg} ${categoryDetails.border} border text-gray-600 group-hover:shadow-md`
                                    }`}>
                                    <IconComponent size={28} />
                                </div>

                                {/* Category Name */}
                                <h3 className={`font-bold text-sm mb-1 transition-colors leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-800'
                                    }`}>
                                    {category.categoryname}
                                </h3>

                                {/* Category Image Preview */}
                                {hasImage && (
                                    <div className="mt-3 h-20 rounded-xl overflow-hidden relative">
                                        <img
                                            src={category.images[0].url}
                                            alt={category.categoryname}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent ${isSelected ? 'opacity-0' : 'opacity-100'
                                            } transition-opacity`} />
                                    </div>
                                )}

                                {/* Hover Effect Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${categoryDetails.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />
                            </div>

                            {/* Bottom Accent Line */}
                            <div className={`h-1 bg-gradient-to-r ${categoryDetails.gradient} transform origin-left transition-transform duration-300 ${isSelected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                }`} />
                        </motion.button>
                    );
                })}

                {/* Add New Category Button */}
                <motion.button
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: filteredCategories.length * 0.04 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOpenAddModal(true)}
                    className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300 text-center group min-h-[180px] flex flex-col items-center justify-center"
                >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gray-200 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25">
                        <MdAdd className="text-gray-500 group-hover:text-white transition-colors" size={28} />
                    </div>
                    <h3 className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors text-sm">
                        Request New Category
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-500">Can't find your category?</p>
                </motion.button>
            </div>

            {/* No Results */}
            {filteredCategories.length === 0 && searchQuery && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <MdSearch className="text-gray-400" size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No categories found</h3>
                    <p className="text-gray-500 text-sm mb-6">Try a different search term or request a new category</p>
                    <button
                        onClick={() => setOpenAddModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                    >
                        Request New Category
                    </button>
                </motion.div>
            )}

            {/* Selected Category Info */}
            {productData.categoryId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-lg shadow-emerald-500/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
                            <MdAutoAwesome size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">✓ Category Selected</p>
                            <h3 className="text-lg font-bold text-emerald-800">{productData.categoryName}</h3>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-lg">
                            <MdCheck className="text-emerald-600" size={20} />
                            <span className="text-sm font-medium text-emerald-700">Ready to continue</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Add Category Modal */}
            <Modal open={openAddModal} onClose={() => { setOpenAddModal(false); fetchCategories(); }}>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-3xl shadow-2xl w-[90%] sm:w-[500px] max-h-[90vh] overflow-y-auto">
                    <AddCategory onClose={() => { setOpenAddModal(false); fetchCategories(); }} />
                </Box>
            </Modal>
        </div>
    );
}

export default StepCategory;
