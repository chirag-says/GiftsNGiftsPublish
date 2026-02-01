import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { MdSubdirectoryArrowRight, MdSearch, MdCheck, MdAdd, MdFolder, MdFolderOpen } from 'react-icons/md';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddSubCategory from '../../../Category/AddSubCategory';

function StepSubcategory() {
    const { productData, subcategories, updateProductData, errors, fetchSubcategories } = useWizard();
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);

    const filteredSubcategories = subcategories.filter(sub => {
        const belongsToCategory = sub.category?._id === productData.categoryId || sub.category === productData.categoryId;
        const matchesSearch = sub.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
        return belongsToCategory && matchesSearch;
    });

    const handleSubcategorySelect = (subcategory) => {
        updateProductData('subcategoryId', subcategory._id);
        updateProductData('subcategoryName', subcategory.subcategory);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-4 shadow-lg shadow-purple-500/25">
                    <MdSubdirectoryArrowRight size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Select Subcategory</h2>
                <p className="text-gray-500 mt-2 text-sm">Choose a specific subcategory for your product</p>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100">
                    {productData.categoryName}
                </span>
                <MdSubdirectoryArrowRight className="text-gray-400" />
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium border border-purple-100">
                    {productData.subcategoryName || 'Select Subcategory'}
                </span>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
                <div className="relative">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                    <input
                        type="text"
                        placeholder="Search subcategories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all outline-none text-sm bg-gray-50/50"
                    />
                </div>
            </div>

            {/* Error Message */}
            {errors.subcategoryId && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {errors.subcategoryId}
                    </span>
                </motion.div>
            )}

            {/* Subcategories Grid */}
            {filteredSubcategories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredSubcategories.map((subcategory, index) => {
                        const isSelected = productData.subcategoryId === subcategory._id;

                        return (
                            <motion.button
                                key={subcategory._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleSubcategorySelect(subcategory)}
                                className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left group ${isSelected
                                    ? 'border-purple-500 bg-purple-50/50 shadow-md'
                                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                                    }`}
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                                    >
                                        <MdCheck className="text-white" size={14} />
                                    </motion.div>
                                )}

                                {/* Subcategory Preview Image or Icon */}
                                {subcategory.images && subcategory.images[0] ? (
                                    <div className="w-14 h-14 rounded-xl overflow-hidden mb-3 border border-gray-100">
                                        <img
                                            src={subcategory.images[0].url}
                                            alt={subcategory.subcategory}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className={`w-14 h-14 rounded-xl mb-3 flex items-center justify-center transition-colors ${isSelected
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                        }`}>
                                        {isSelected ? <MdFolderOpen size={24} /> : <MdFolder size={24} />}
                                    </div>
                                )}

                                {/* Subcategory Name */}
                                <h3 className={`font-semibold text-sm transition-colors ${isSelected ? 'text-purple-700' : 'text-gray-800'
                                    }`}>
                                    {subcategory.subcategory}
                                </h3>
                            </motion.button>
                        );
                    })}

                    {/* Add New Subcategory Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: filteredSubcategories.length * 0.03 }}
                        onClick={() => setOpenAddModal(true)}
                        className="p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-purple-300 transition-all duration-200 text-center group"
                    >
                        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gray-200 group-hover:bg-purple-500 transition-colors flex items-center justify-center">
                            <MdAdd className="text-gray-500 group-hover:text-white transition-colors" size={22} />
                        </div>
                        <h3 className="font-semibold text-gray-600 group-hover:text-purple-600 transition-colors text-sm">
                            Request Subcategory
                        </h3>
                    </motion.button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <MdFolder className="text-gray-400" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {searchQuery ? 'No subcategories found' : 'No subcategories available'}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                        {searchQuery
                            ? 'Try a different search term or request a new subcategory'
                            : 'This category doesn\'t have any subcategories yet'}
                    </p>
                    <button
                        onClick={() => setOpenAddModal(true)}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
                    >
                        Request New Subcategory
                    </button>
                </motion.div>
            )}

            {/* Selected Subcategory Info */}
            {productData.subcategoryId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200"
                >
                    <div className="flex items-center gap-4">
                        {subcategories.find(s => s._id === productData.subcategoryId)?.images?.[0] ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-purple-200">
                                <img
                                    src={subcategories.find(s => s._id === productData.subcategoryId).images[0].url}
                                    alt={productData.subcategoryName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                                <MdFolderOpen size={20} />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Selected Subcategory</p>
                            <h3 className="text-base font-bold text-purple-800">{productData.subcategoryName}</h3>
                        </div>
                        <MdCheck className="text-purple-500" size={24} />
                    </div>
                </motion.div>
            )}

            {/* Add Subcategory Modal */}
            <Modal open={openAddModal} onClose={() => { setOpenAddModal(false); fetchSubcategories(); }}>
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[500px] max-h-[90vh] overflow-y-auto">
                    <AddSubCategory onSubCategoryAdded={() => { setOpenAddModal(false); fetchSubcategories(); }} />
                </Box>
            </Modal>
        </div>
    );
}

export default StepSubcategory;
