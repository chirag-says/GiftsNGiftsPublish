/**
 * Product Comparison Tool
 * Side-by-side product comparison for B2B decisions
 * Features: Up to 4 products, key metrics, easy selection
 */
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiX, HiPlus, HiCheck, HiStar, HiShoppingCart,
    HiArrowRight, HiTrash, HiCheckCircle, HiXCircle
} from "react-icons/hi";
import api from "../../utils/api";

function ProductComparison() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Get product IDs from URL
    const productIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    useEffect(() => {
        if (productIds.length > 0) {
            fetchComparisonData();
        }
    }, [searchParams]);

    const fetchComparisonData = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/compare', { productIds });
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching comparison:', error);
            // Use sample data for demo
            setProducts(getSampleComparisonData());
        } finally {
            setLoading(false);
        }
    };

    const addProduct = (productId) => {
        if (productIds.length >= 4) {
            return;
        }
        const newIds = [...productIds, productId];
        setSearchParams({ ids: newIds.join(',') });
        setShowAddModal(false);
        setSearchQuery('');
    };

    const removeProduct = (productId) => {
        const newIds = productIds.filter(id => id !== productId);
        if (newIds.length > 0) {
            setSearchParams({ ids: newIds.join(',') });
        } else {
            setSearchParams({});
        }
    };

    const searchProducts = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await api.get('/api/client/productsbycategory');
            if (res.data.success) {
                const allProducts = res.data.categories.flatMap(cat => cat.products);
                const filtered = allProducts
                    .filter(p =>
                        p.title.toLowerCase().includes(query.toLowerCase()) &&
                        !productIds.includes(p._id)
                    )
                    .slice(0, 5);
                setSearchResults(filtered);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    // Comparison attributes
    const comparisonAttributes = [
        { key: 'price', label: 'Price', format: (v) => `₹${v?.toLocaleString()}` },
        { key: 'bulkPrice50', label: 'Bulk Price (50+)', format: (v) => v ? `₹${v?.toLocaleString()}` : '-' },
        { key: 'bulkPrice100', label: 'Bulk Price (100+)', format: (v) => v ? `₹${v?.toLocaleString()}` : '-' },
        { key: 'rating', label: 'Rating', format: (v) => `⭐ ${v || 4.5}/5` },
        { key: 'reviewCount', label: 'Reviews', format: (v) => v || 0 },
        { key: 'category', label: 'Category', format: (v) => v || '-' },
        { key: 'state', label: 'Origin', format: (v) => v || 'Northeast India' },
        { key: 'stock', label: 'Stock', format: (v) => v > 50 ? 'In Stock' : v > 0 ? 'Low Stock' : 'Out of Stock' },
        { key: 'moq', label: 'Min. Order', format: (v) => `${v || 1} units` },
        { key: 'deliveryDays', label: 'Delivery', format: (v) => v || '5-7 days' },
        { key: 'customLogo', label: 'Logo Customization', format: (v) => v ? '✓' : '✗', isBoolean: true },
        { key: 'customMessage', label: 'Custom Message', format: (v) => v ? '✓' : '✗', isBoolean: true },
        { key: 'premiumPack', label: 'Premium Packaging', format: (v) => v ? '✓' : '✗', isBoolean: true }
    ];

    // Prepare products with all attributes
    const preparedProducts = products.map(p => ({
        ...p,
        bulkPrice50: p.bulkPricing?.tier50,
        bulkPrice100: p.bulkPricing?.tier100,
        customLogo: p.customizationAvailable?.logo,
        customMessage: p.customizationAvailable?.message,
        premiumPack: p.customizationAvailable?.packaging
    }));

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Premium Fonts */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        `}
            </style>

            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <Link to="/" className="hover:text-amber-600 transition">Home</Link>
                        <span>/</span>
                        <span className="text-slate-800 font-medium">Compare Products</span>
                    </nav>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1
                                className="text-2xl md:text-3xl font-bold text-slate-900"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Compare Products
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Compare up to 4 products side by side
                            </p>
                        </div>
                        {products.length > 0 && products.length < 4 && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                            >
                                <HiPlus className="w-5 h-5" />
                                Add Product
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState onAdd={() => setShowAddModal(true)} />
                ) : (
                    <>
                        {/* Comparison Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            {/* Product Headers */}
                            <div className="grid divide-x divide-slate-200" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                                <div className="p-4 bg-slate-50 flex items-end">
                                    <span className="text-sm font-semibold text-slate-500">Products</span>
                                </div>
                                {preparedProducts.map((product) => (
                                    <div key={product._id} className="p-4 relative">
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeProduct(product._id)}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                                        >
                                            <HiX className="w-5 h-5" />
                                        </button>

                                        {/* Product Image */}
                                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-4">
                                            <img
                                                src={product.image || 'https://via.placeholder.com/200'}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Title */}
                                        <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2">
                                            {product.title}
                                        </h3>

                                        {/* Price */}
                                        <div className="text-xl font-bold text-slate-900 mb-3">
                                            ₹{product.price?.toLocaleString()}
                                        </div>

                                        {/* Perfect For */}
                                        {product.perfectFor && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {product.perfectFor.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Select Button */}
                                        <Link
                                            to={`/products/${product._id}`}
                                            className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition"
                                        >
                                            Select
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Comparison Rows */}
                            {comparisonAttributes.map((attr, idx) => (
                                <div
                                    key={attr.key}
                                    className={`grid divide-x divide-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                    style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                                >
                                    {/* Attribute Label */}
                                    <div className="p-4 flex items-center">
                                        <span className="text-sm font-medium text-slate-600">{attr.label}</span>
                                    </div>

                                    {/* Attribute Values */}
                                    {preparedProducts.map((product) => {
                                        const value = product[attr.key];
                                        const displayValue = attr.format(value);

                                        return (
                                            <div key={product._id} className="p-4 flex items-center justify-center">
                                                {attr.isBoolean ? (
                                                    value ? (
                                                        <HiCheckCircle className="w-6 h-6 text-green-500" />
                                                    ) : (
                                                        <HiXCircle className="w-6 h-6 text-slate-300" />
                                                    )
                                                ) : (
                                                    <span className={`text-sm font-medium ${attr.key === 'price' || attr.key.includes('bulk')
                                                            ? 'text-slate-900 font-bold'
                                                            : 'text-slate-600'
                                                        }`}>
                                                        {displayValue}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {/* Features Section */}
                            <div
                                className="grid divide-x divide-slate-200 bg-slate-50"
                                style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
                            >
                                <div className="p-4">
                                    <span className="text-sm font-semibold text-slate-600">Key Features</span>
                                </div>
                                {preparedProducts.map((product) => (
                                    <div key={product._id} className="p-4">
                                        <ul className="space-y-1">
                                            {product.features?.slice(0, 4).map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <HiCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setSearchParams({})}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                            >
                                <HiTrash className="w-5 h-5" />
                                Clear All
                            </button>
                            <Link
                                to="/shop-by-occasion"
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition"
                            >
                                Continue Shopping
                                <HiArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-800">Add Product to Compare</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 rounded-lg hover:bg-slate-100 transition"
                                >
                                    <HiX className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => searchProducts(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                                    autoFocus
                                />
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    searchResults.map((product) => (
                                        <button
                                            key={product._id}
                                            onClick={() => addProduct(product._id)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition"
                                        >
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                                <img
                                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/64'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-semibold text-slate-800 line-clamp-1">{product.title}</h4>
                                                <p className="text-sm text-slate-500">₹{product.price?.toLocaleString()}</p>
                                            </div>
                                            <HiPlus className="w-6 h-6 text-amber-500" />
                                        </button>
                                    ))
                                ) : searchQuery.length >= 2 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        No products found
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400">
                                        Start typing to search products
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Empty State Component
function EmptyState({ onAdd }) {
    return (
        <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">No products to compare</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Add products to compare their features, prices, and specifications side by side
            </p>
            <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
            >
                <HiPlus className="w-5 h-5" />
                Add First Product
            </button>
        </div>
    );
}

// Sample comparison data for demo
function getSampleComparisonData() {
    return [
        {
            _id: '1',
            title: 'Assam Tea Premium Gift Hamper',
            price: 1299,
            image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300',
            rating: 4.8,
            reviewCount: 24,
            category: 'Tea & Beverages',
            state: 'Assam',
            stock: 150,
            moq: 1,
            deliveryDays: '5-7 days',
            bulkPricing: { tier50: 1169, tier100: 1104, tier500: 1039 },
            customizationAvailable: { logo: true, message: true, packaging: true },
            perfectFor: ['Clients', 'Employees'],
            features: ['100g Assam Orthodox Tea', '50g Green Tea', 'Bamboo Tea Infuser', 'Handwoven Tea Cozy']
        },
        {
            _id: '2',
            title: 'Muga Silk Designer Scarf',
            price: 2499,
            image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=300',
            rating: 4.9,
            reviewCount: 56,
            category: 'Textiles',
            state: 'Assam',
            stock: 45,
            moq: 1,
            deliveryDays: '7-10 days',
            bulkPricing: { tier50: 2249, tier100: 2124, tier500: 1999 },
            customizationAvailable: { logo: false, message: true, packaging: true },
            perfectFor: ['VIP Clients', 'Partners'],
            features: ['Pure Muga Silk', 'Handwoven', 'Traditional Patterns', 'Gift Box Included']
        }
    ];
}

export default ProductComparison;
