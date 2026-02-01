/**
 * Gift For Landing Page
 * Dynamic page for specific relationships (e.g., Gifts for Brother)
 */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useSearchParams, useLocation } from "react-router-dom";
import api from "../../utils/api";
import {
    HiFilter, HiArrowRight, HiStar, HiChat, HiDocumentText,
    HiCheckCircle, HiX, HiChevronDown, HiViewGrid, HiViewList,
    HiAdjustments, HiSparkles, HiShoppingCart, HiHeart, HiEye
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

// Budget filter options
const budgetFilters = [
    { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
    { id: '500-1000', label: '₹500-1,000', min: 500, max: 1000 },
    { id: '1000-2500', label: '₹1,000-2,500', min: 1000, max: 2500 },
    { id: '2500-5000', label: '₹2,500-5,000', min: 2500, max: 5000 },
    { id: '5000-plus', label: '₹5,000+', min: 5000, max: 100000 }
];

function GiftForLandingPage() {
    const params = useParams();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Determine slug: either from params (for /gift-for/:slug) or from pathname (for /daughter)
    // Remove leading/trailing slashes and get the last segment if needed or just the first one after root
    const rawSlug = params.slug || location.pathname.split('/').filter(Boolean).pop();
    const slug = rawSlug?.toLowerCase();

    // State
    const [relationship, setRelationship] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [showFilters, setShowFilters] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    // Filters state
    const [filters, setFilters] = useState({
        budget: searchParams.get('budget') || '',
        sort: searchParams.get('sort') || 'popular'
    });

    // Fetch data on mount and filter change
    useEffect(() => {
        fetchData();

        // Update URL params
        const params = new URLSearchParams();
        if (filters.budget) params.set('budget', filters.budget);
        if (filters.sort !== 'popular') params.set('sort', filters.sort);
        setSearchParams(params);
    }, [slug, filters, pagination.page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const budgetFilter = budgetFilters.find(b => b.id === filters.budget);

            const res = await api.get(`/api/gift-for/${slug}/products`, {
                params: {
                    ...(budgetFilter && {
                        minPrice: budgetFilter.min,
                        maxPrice: budgetFilter.max
                    }),
                    sort: filters.sort,
                    page: pagination.page,
                    limit: 24
                }
            });

            if (res.data.success) {
                setRelationship(res.data.data.relationship);
                setProducts(res.data.data.products);
                setPagination(res.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            budget: '',
            sort: 'popular'
        });
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.budget) count++;
        return count;
    }, [filters]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`}
            </style>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#2C1A0F] via-[#3A2518] to-[#2C1A0F] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-white/60 mb-6">
                        <Link to="/" className="hover:text-white transition">Home</Link>
                        <span>/</span>
                        <span className="text-[#d4af37] font-medium">Gifts for {relationship?.name || '...'}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl">{relationship?.emoji || '🎁'}</span>
                                <h1
                                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Gifts for <span className="text-[#d4af37] italic">{relationship?.name || '...'}</span>
                                </h1>
                            </div>
                            <p className="text-white/70 text-lg max-w-2xl">
                                {relationship?.description || 'Curated collection of authentic Northeast treasures.'}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#d4af37]">{pagination.total}</div>
                                <div className="text-xs text-white/50 uppercase tracking-wider">Products</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <aside className={`lg:w-72 shrink-0 ${showFilters ? '' : 'hidden lg:block'}`}>
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HiAdjustments className="w-5 h-5 text-slate-600" />
                                    <h3 className="font-bold text-slate-800">Filters</h3>
                                </div>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-xs text-rose-500 font-medium">
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Budget Filter */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <span>💰</span> Budget
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {budgetFilters.map((budget) => (
                                        <button
                                            key={budget.id}
                                            onClick={() => updateFilter('budget', filters.budget === budget.id ? '' : budget.id)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filters.budget === budget.id
                                                ? 'bg-[#d4af37] text-white shadow-md'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {budget.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium"
                            >
                                <HiFilter className="w-5 h-5" /> Filters
                            </button>

                            <div className="flex items-center gap-3 ml-auto">
                                <select
                                    value={filters.sort}
                                    onChange={(e) => updateFilter('sort', e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                                >
                                    <option value="popular">Popular</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                                <p className="text-slate-500 mb-6">We couldn't find any gifts for {relationship?.name} matching your criteria.</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 rounded-xl bg-[#d4af37] text-white font-semibold"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors
                                            ${pagination.page === i + 1
                                                ? 'bg-[#d4af37] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all"
        >
            <Link to={`/products/${product._id}`} className="block relative aspect-square overflow-hidden">
                <img
                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {product.discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                        {product.discount}% OFF
                    </span>
                )}
            </Link>
            <div className="p-4">
                <h3 className="font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-[#d4af37] transition-colors">
                    {product.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                    {product.oldprice > product.price && (
                        <span className="text-sm text-slate-400 line-through">₹{product.oldprice}</span>
                    )}
                </div>
                {product.giftFor && product.giftFor.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {product.giftFor.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default GiftForLandingPage;
