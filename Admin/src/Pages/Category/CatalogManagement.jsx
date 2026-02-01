/**
 * Catalog Management Page
 * Admin interface for managing:
 * - Categories & Subcategories
 * - Occasions (Shop by Occasion)
 * - States (Shop by State)
 * - Gift For Relations (Shop by Relation)
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdCategory, MdCelebration, MdLocationOn, MdFavorite, MdAdd, MdEdit, MdDelete,
    MdRefresh, MdSearch, MdImage, MdSave, MdClose, MdCheck, MdStar, MdStarBorder,
    MdVisibility, MdVisibilityOff, MdUpload, MdWarning, MdInfo
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../utils/api';

// Tab configuration
const TABS = [
    { id: 'occasions', label: 'Occasions', icon: MdCelebration, color: 'pink' },
    { id: 'states', label: 'States', icon: MdLocationOn, color: 'teal' },
    { id: 'giftfor', label: 'Gift For', icon: MdFavorite, color: 'red' },
    { id: 'subcategories', label: 'Subcategories', icon: MdCategory, color: 'purple' }
];

// Occasion categories
const OCCASION_CATEGORIES = ['corporate', 'personal', 'seasonal', 'festival', 'cultural'];

// GiftFor categories
const GIFTFOR_CATEGORIES = ['family', 'romantic', 'friends', 'professional', 'age-gender', 'special'];

function CatalogManagement() {
    const [activeTab, setActiveTab] = useState('occasions');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Data states
    const [occasions, setOccasions] = useState([]);
    const [states, setStates] = useState([]);
    const [giftFor, setGiftFor] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch data on mount and tab change
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Fetch categories for subcategory dropdown
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/getcategories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'occasions':
                    endpoint = '/api/admin/catalog/occasions';
                    break;
                case 'states':
                    endpoint = '/api/admin/catalog/states';
                    break;
                case 'giftfor':
                    endpoint = '/api/admin/catalog/gift-for';
                    break;
                case 'subcategories':
                    endpoint = '/api/admin/catalog/subcategories';
                    break;
                default:
                    return;
            }

            const response = await api.get(endpoint);
            if (response.data.success) {
                switch (activeTab) {
                    case 'occasions':
                        setOccasions(response.data.data);
                        break;
                    case 'states':
                        setStates(response.data.data);
                        break;
                    case 'giftfor':
                        setGiftFor(response.data.data);
                        break;
                    case 'subcategories':
                        setSubcategories(response.data.data);
                        break;
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async (type) => {
        try {
            setLoading(true);
            const response = await api.post(`/api/admin/catalog/${type}/seed`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to seed data');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setEditItem(null);
        setFormData(getDefaultFormData());
        setImageFile(null);
        setImagePreview('');
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalMode('edit');
        setEditItem(item);
        setFormData({ ...item });
        setImagePreview(item.image?.url || '');
        setImageFile(null);
        setIsModalOpen(true);
    };

    const getDefaultFormData = () => {
        switch (activeTab) {
            case 'occasions':
                return { name: '', category: 'personal', description: '', isFeatured: false, displayOrder: 0 };
            case 'states':
                return { name: '', famousFor: '', description: '', highlights: [], isNorthEast: true, isFeatured: false, displayOrder: 0 };
            case 'giftfor':
                return { name: '', category: 'family', description: '', isFeatured: false, displayOrder: 0 };
            case 'subcategories':
                return { subcategory: '', category: '', description: '', displayOrder: 0 };
            default:
                return {};
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'image' || key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') return;
                if (key === 'highlights' || key === 'popularFor') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Add image if selected
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            let endpoint = '';
            let method = modalMode === 'add' ? 'post' : 'put';

            switch (activeTab) {
                case 'occasions':
                    endpoint = modalMode === 'add'
                        ? '/api/admin/catalog/occasions'
                        : `/api/admin/catalog/occasions/${editItem._id}`;
                    break;
                case 'states':
                    endpoint = modalMode === 'add'
                        ? '/api/admin/catalog/states'
                        : `/api/admin/catalog/states/${editItem._id}`;
                    break;
                case 'giftfor':
                    endpoint = modalMode === 'add'
                        ? '/api/admin/catalog/gift-for'
                        : `/api/admin/catalog/gift-for/${editItem._id}`;
                    break;
                case 'subcategories':
                    endpoint = modalMode === 'add'
                        ? '/api/admin/catalog/subcategories'
                        : `/api/admin/catalog/subcategories/${editItem._id}`;
                    break;
            }

            const response = await api[method](endpoint, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setIsModalOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error submitting:', error);
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.name || item.subcategory}"?`)) return;

        try {
            let endpoint = '';
            switch (activeTab) {
                case 'occasions':
                    endpoint = `/api/admin/catalog/occasions/${item._id}`;
                    break;
                case 'states':
                    endpoint = `/api/admin/catalog/states/${item._id}`;
                    break;
                case 'giftfor':
                    endpoint = `/api/admin/catalog/gift-for/${item._id}`;
                    break;
                case 'subcategories':
                    endpoint = `/api/admin/catalog/subcategories/${item._id}`;
                    break;
            }

            const response = await api.delete(endpoint);
            if (response.data.success) {
                toast.success('Deleted successfully');
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const toggleFeatured = async (item) => {
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'occasions':
                    endpoint = `/api/admin/catalog/occasions/${item._id}`;
                    break;
                case 'states':
                    endpoint = `/api/admin/catalog/states/${item._id}`;
                    break;
                case 'giftfor':
                    endpoint = `/api/admin/catalog/gift-for/${item._id}`;
                    break;
                default:
                    return;
            }

            const response = await api.put(endpoint, { isFeatured: !item.isFeatured });
            if (response.data.success) {
                toast.success(`${item.isFeatured ? 'Removed from' : 'Added to'} featured`);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const toggleActive = async (item) => {
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'occasions':
                    endpoint = `/api/admin/catalog/occasions/${item._id}`;
                    break;
                case 'states':
                    endpoint = `/api/admin/catalog/states/${item._id}`;
                    break;
                case 'giftfor':
                    endpoint = `/api/admin/catalog/gift-for/${item._id}`;
                    break;
                case 'subcategories':
                    endpoint = `/api/admin/catalog/subcategories/${item._id}`;
                    break;
            }

            const response = await api.put(endpoint, { isActive: !item.isActive });
            if (response.data.success) {
                toast.success(`${item.isActive ? 'Deactivated' : 'Activated'}`);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    // Get current data based on active tab
    const getCurrentData = () => {
        let data = [];
        switch (activeTab) {
            case 'occasions': data = occasions; break;
            case 'states': data = states; break;
            case 'giftfor': data = giftFor; break;
            case 'subcategories': data = subcategories; break;
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(item =>
                (item.name || item.subcategory || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query)
            );
        }

        return data;
    };

    const currentData = getCurrentData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    📁 Catalog Management
                </h1>
                <p className="text-gray-500">
                    Manage occasions, states, relationships, and subcategories for your store
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${isActive
                                ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/30`
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                            style={isActive ? { backgroundColor: tab.color === 'pink' ? '#ec4899' : tab.color === 'teal' ? '#14b8a6' : tab.color === 'red' ? '#ef4444' : '#8b5cf6' } : {}}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                    >
                        <MdRefresh size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {activeTab !== 'subcategories' && (
                        <button
                            onClick={() => handleSeed(activeTab === 'giftfor' ? 'gift-for' : activeTab)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-100"
                        >
                            <MdUpload size={18} />
                            Seed Defaults
                        </button>
                    )}

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                    >
                        <MdAdd size={18} />
                        Add New
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : currentData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <MdWarning size={48} className="mb-4" />
                        <p className="text-lg font-medium">No items found</p>
                        <p className="text-sm">Click "Add New" to create one or "Seed Defaults" to add sample data</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Image</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Name</th>
                                    {activeTab === 'subcategories' && (
                                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Category</th>
                                    )}
                                    {(activeTab === 'occasions' || activeTab === 'giftfor') && (
                                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Type</th>
                                    )}
                                    {activeTab === 'states' && (
                                        <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Famous For</th>
                                    )}
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Products</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item, index) => (
                                    <motion.tr
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border">
                                                {item.image?.url ? (
                                                    <img src={item.image.url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <MdImage className="text-gray-400" size={24} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.name || item.subcategory}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.description || item.slug}</p>
                                            </div>
                                        </td>
                                        {activeTab === 'subcategories' && (
                                            <td className="py-4 px-6">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                                                    {item.category?.categoryname || '-'}
                                                </span>
                                            </td>
                                        )}
                                        {(activeTab === 'occasions' || activeTab === 'giftfor') && (
                                            <td className="py-4 px-6">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium capitalize">
                                                    {item.category}
                                                </span>
                                            </td>
                                        )}
                                        {activeTab === 'states' && (
                                            <td className="py-4 px-6">
                                                <p className="text-sm text-gray-600 truncate max-w-[150px]">{item.famousFor || '-'}</p>
                                            </td>
                                        )}
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                                {item.productCount || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {item.isActive !== false ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                                        <MdCheck size={12} /> Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                                                        Inactive
                                                    </span>
                                                )}
                                                {item.isFeatured && (
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                                        <MdStar size={12} /> Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1">
                                                {activeTab !== 'subcategories' && (
                                                    <button
                                                        onClick={() => toggleFeatured(item)}
                                                        className={`p-2 rounded-lg transition-colors ${item.isFeatured
                                                            ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                            }`}
                                                        title={item.isFeatured ? 'Remove from featured' : 'Add to featured'}
                                                    >
                                                        {item.isFeatured ? <MdStar size={18} /> : <MdStarBorder size={18} />}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => toggleActive(item)}
                                                    className={`p-2 rounded-lg transition-colors ${item.isActive !== false
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    title={item.isActive !== false ? 'Deactivate' : 'Activate'}
                                                >
                                                    {item.isActive !== false ? <MdVisibility size={18} /> : <MdVisibilityOff size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                                    title="Edit"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                    title="Delete"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <MdInfo className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                        <li>Items you add here will appear in the respective "Shop by" sections on the homepage</li>
                        <li>Featured items are prioritized and may appear in special sections</li>
                        <li>Products are automatically linked based on their tags (occasions, giftFor, state)</li>
                        <li>Upload images to make cards more visually appealing</li>
                    </ul>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {modalMode === 'add' ? 'Add New' : 'Edit'} {activeTab === 'giftfor' ? 'Relation' : activeTab.slice(0, -1)}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <MdImage className="text-gray-400" size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium inline-flex items-center gap-2"
                                            >
                                                <MdUpload size={16} />
                                                Choose Image
                                            </label>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {activeTab === 'subcategories' ? 'Subcategory Name' : 'Name'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name || formData.subcategory || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            [activeTab === 'subcategories' ? 'subcategory' : 'name']: e.target.value
                                        })}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="e.g., Diwali, Assam, Brother..."
                                    />
                                </div>

                                {/* Category (for subcategories) */}
                                {activeTab === 'subcategories' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parent Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.category?._id || formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.categoryname}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Type/Category (for occasions/giftfor) */}
                                {(activeTab === 'occasions' || activeTab === 'giftfor') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                        <select
                                            value={formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none capitalize"
                                        >
                                            {(activeTab === 'occasions' ? OCCASION_CATEGORIES : GIFTFOR_CATEGORIES).map((cat) => (
                                                <option key={cat} value={cat} className="capitalize">{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Famous For (states only) */}
                                {activeTab === 'states' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Famous For</label>
                                        <input
                                            type="text"
                                            value={formData.famousFor || ''}
                                            onChange={(e) => setFormData({ ...formData, famousFor: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="e.g., Tea, Silk, Bamboo Crafts"
                                        />
                                    </div>
                                )}



                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        placeholder="Brief description..."
                                    />
                                </div>

                                {/* Display Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder || 0}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>

                                {/* Featured Toggle */}
                                {activeTab !== 'subcategories' && (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isFeatured"
                                            checked={formData.isFeatured || false}
                                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                                            Mark as Featured
                                        </label>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <MdSave size={18} />
                                                {modalMode === 'add' ? 'Add' : 'Save Changes'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CatalogManagement;
