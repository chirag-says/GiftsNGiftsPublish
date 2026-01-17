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
    MdSpa
} from 'react-icons/md';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCategory from '../../../Category/AddCategory';

// Map category names to professional icons
const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('tea') || name.includes('teaware')) return MdLocalCafe;
    if (name.includes('bamboo') || name.includes('cane')) return MdForest;
    if (name.includes('cake') || name.includes('bakery')) return MdCake;
    if (name.includes('saree') || name.includes('sari')) return MdCheckroom;
    if (name.includes('shawl') || name.includes('stole')) return MdSpa;
    if (name.includes('jewel') || name.includes('ornament')) return MdDiamond;
    if (name.includes('women') || name.includes('wear') || name.includes('cloth')) return MdCheckroom;
    if (name.includes('electronic')) return MdDevices;
    if (name.includes('home') || name.includes('kitchen')) return MdHome;
    if (name.includes('book')) return MdMenuBook;
    return MdInventory2;
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
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 shadow-lg shadow-blue-500/25">
                    <MdCategory size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Select Product Category</h2>
                <p className="text-gray-500 mt-2 text-sm">Choose the category that best describes your product</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
                <div className="relative">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm bg-gray-50/50"
                    />
                </div>
            </div>

            {/* Error Message */}
            {errors.categoryId && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {errors.categoryId}
                    </span>
                </motion.div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCategories.map((category, index) => {
                    const isSelected = productData.categoryId === category._id;
                    const IconComponent = getCategoryIcon(category.categoryname);

                    return (
                        <motion.button
                            key={category._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleCategorySelect(category)}
                            className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left group ${isSelected
                                ? 'border-blue-500 bg-blue-50/50 shadow-md'
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                                }`}
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                                >
                                    <MdCheck className="text-white" size={14} />
                                </motion.div>
                            )}

                            {/* Category Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                }`}>
                                <IconComponent size={24} />
                            </div>

                            {/* Category Name */}
                            <h3 className={`font-semibold text-sm mb-1 transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-800'
                                }`}>
                                {category.categoryname}
                            </h3>

                            {/* Category Image Preview */}
                            {category.images && category.images[0] && (
                                <div className="mt-3 h-16 rounded-lg overflow-hidden">
                                    <img
                                        src={category.images[0].url}
                                        alt={category.categoryname}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </motion.button>
                    );
                })}

                {/* Add New Category Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: filteredCategories.length * 0.03 }}
                    onClick={() => setOpenAddModal(true)}
                    className="p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 text-center group"
                >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-200 group-hover:bg-blue-500 transition-colors flex items-center justify-center">
                        <MdAdd className="text-gray-500 group-hover:text-white transition-colors" size={22} />
                    </div>
                    <h3 className="font-semibold text-gray-600 group-hover:text-gray-800 transition-colors text-sm">
                        Request New Category
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Can't find your category?</p>
                </motion.button>
            </div>

            {/* No Results */}
            {filteredCategories.length === 0 && searchQuery && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <MdSearch className="text-gray-400" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No categories found</h3>
                    <p className="text-gray-500 text-sm">Try a different search term or request a new category</p>
                    <button
                        onClick={() => setOpenAddModal(true)}
                        className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
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
                    className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                            {React.createElement(getCategoryIcon(productData.categoryName), { size: 20 })}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Selected Category</p>
                            <h3 className="text-base font-bold text-emerald-800">{productData.categoryName}</h3>
                        </div>
                        <MdCheck className="text-emerald-500" size={24} />
                    </div>
                </motion.div>
            )}

            {/* Add Category Modal */}
            <Modal open={openAddModal} onClose={() => { setOpenAddModal(false); fetchCategories(); }}>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[500px] max-h-[90vh] overflow-y-auto">
                    <AddCategory onClose={() => { setOpenAddModal(false); fetchCategories(); }} />
                </Box>
            </Modal>
        </div>
    );
}

export default StepCategory;
