/**
 * Homepage Collections Management
 * Admin can curate which products appear in "Best of North East" and "Under ₹999" sections
 */
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    HiStar, HiSearch, HiCheck, HiX, HiRefresh,
    HiSparkles, HiCurrencyRupee, HiPhotograph
} from 'react-icons/hi';
import { toast } from 'react-toastify';

function HomeCollections() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('best-of-northeast');

    // All available products
    const [allProducts, setAllProducts] = useState([]);

    // Selected products for each collection
    const [bestOfNorthEast, setBestOfNorthEast] = useState([]);
    const [under999, setUnder999] = useState([]);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/home-collections');
            if (res.data.success) {
                setAllProducts(res.data.data.allProducts || []);
                setBestOfNorthEast(res.data.data.bestOfNorthEast?.map(p => p._id) || []);
                setUnder999(res.data.data.under999?.map(p => p._id) || []);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
            toast.error('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = async (productId, collection) => {
        try {
            const endpoint = collection === 'best-of-northeast'
                ? `/api/admin/toggle-best-of-ne/${productId}`
                : `/api/admin/toggle-under-999/${productId}`;

            const res = await api.put(endpoint);

            if (res.data.success) {
                if (collection === 'best-of-northeast') {
                    setBestOfNorthEast(prev =>
                        prev.includes(productId)
                            ? prev.filter(id => id !== productId)
                            : [...prev, productId]
                    );
                } else {
                    setUnder999(prev =>
                        prev.includes(productId)
                            ? prev.filter(id => id !== productId)
                            : [...prev, productId]
                    );
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error('Error toggling product:', error);
            toast.error('Failed to update collection');
        }
    };

    const saveAllChanges = async () => {
        setSaving(true);
        try {
            const res = await api.put('/api/admin/home-collections', {
                bestOfNorthEast,
                under999
            });

            if (res.data.success) {
                toast.success('Collections saved successfully!');
            }
        } catch (error) {
            console.error('Error saving collections:', error);
            toast.error('Failed to save collections');
        } finally {
            setSaving(false);
        }
    };

    // Filter products based on search and current tab
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.state?.toLowerCase().includes(searchQuery.toLowerCase());

        // For Under ₹999 tab, only show products under ₹999
        if (activeTab === 'under-999' && product.price > 999) {
            return false;
        }

        return matchesSearch;
    });

    const selectedProducts = activeTab === 'best-of-northeast' ? bestOfNorthEast : under999;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <HiSparkles className="w-7 h-7 text-amber-500" />
                    Homepage Collections
                </h1>
                <p className="text-gray-500 mt-1">
                    Curate which products appear in the "Best of North East" and "Perfect Gifts Under ₹999" sections on the homepage.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('best-of-northeast')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'best-of-northeast'
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <HiStar className="w-5 h-5" />
                    Best of North East
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-sm">
                        {bestOfNorthEast.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('under-999')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'under-999'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <HiCurrencyRupee className="w-5 h-5" />
                    Perfect Gifts Under ₹999
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-sm">
                        {under999.length}
                    </span>
                </button>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products by name or state..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                    />
                </div>
                <button
                    onClick={fetchCollections}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                >
                    <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Info Banner */}
            <div className={`p-4 rounded-xl mb-6 ${activeTab === 'best-of-northeast'
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-emerald-50 border border-emerald-200'
                }`}>
                <p className={`text-sm ${activeTab === 'best-of-northeast' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {activeTab === 'best-of-northeast'
                        ? '⭐ Select up to 8 top-rated products to showcase as "Best of North East" on the homepage.'
                        : '💰 Select up to 8 budget-friendly products (under ₹999) to showcase on the homepage.'}
                </p>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-square rounded-xl mb-2" />
                            <div className="bg-gray-200 h-4 rounded w-3/4 mb-1" />
                            <div className="bg-gray-200 h-4 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product._id);

                        return (
                            <div
                                key={product._id}
                                onClick={() => toggleProduct(product._id, activeTab)}
                                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isSelected
                                    ? activeTab === 'best-of-northeast'
                                        ? 'border-amber-500 ring-2 ring-amber-200'
                                        : 'border-emerald-500 ring-2 ring-emerald-200'
                                    : 'border-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center ${activeTab === 'best-of-northeast' ? 'bg-amber-500' : 'bg-emerald-500'
                                        } text-white`}>
                                        <HiCheck className="w-4 h-4" />
                                    </div>
                                )}

                                {/* Product Image */}
                                <div className="aspect-square bg-gray-100 relative">
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <HiPhotograph className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-2">
                                    <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                                        {product.rating > 0 && (
                                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                                                <HiStar className="w-3 h-3 text-yellow-400" />
                                                {product.rating}
                                            </span>
                                        )}
                                    </div>
                                    {product.state && (
                                        <span className="text-[10px] text-teal-600">📍{product.state}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">No products found matching your search.</p>
                </div>
            )}

            {/* Save Button */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={saveAllChanges}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <HiRefresh className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <HiCheck className="w-5 h-5" />
                            Save All Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default HomeCollections;
