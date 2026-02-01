/**
 * Occasion Landing Page
 * Dynamic page for each occasion (e.g., Diwali Corporate Gifting)
 * Features: B2B filters, curated collections, product grid, quick view
 */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import {
    HiFilter, HiArrowRight, HiStar, HiChat, HiDocumentText,
    HiCheckCircle, HiX, HiChevronDown, HiViewGrid, HiViewList,
    HiAdjustments, HiSparkles, HiShoppingCart, HiHeart, HiEye
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import ProductQuickView from "./ProductQuickView";

// Budget filter options
const budgetFilters = [
    { id: 'under-500', label: 'Under ₹500', min: 0, max: 500 },
    { id: '500-1000', label: '₹500-1,000', min: 500, max: 1000 },
    { id: '1000-2500', label: '₹1,000-2,500', min: 1000, max: 2500 },
    { id: '2500-5000', label: '₹2,500-5,000', min: 2500, max: 5000 },
    { id: '5000-plus', label: '₹5,000+', min: 5000, max: 100000 }
];

// Quantity filter options
const quantityFilters = [
    { id: '1-25', label: '1-25 units', min: 1, max: 25 },
    { id: '25-50', label: '25-50 units', min: 25, max: 50 },
    { id: '50-100', label: '50-100 units', min: 50, max: 100 },
    { id: '100-500', label: '100-500 units', min: 100, max: 500 },
    { id: '500-plus', label: '500+ units', min: 500, max: 10000 }
];

// Recipient filter options
const recipientFilters = [
    { id: 'clients', label: 'Clients', icon: '🏢' },
    { id: 'employees', label: 'Employees', icon: '👔' },
    { id: 'partners', label: 'Partners', icon: '🤝' },
    { id: 'mixed', label: 'Mixed', icon: '👥' }
];

// Product type filters
const productTypeFilters = [
    { id: 'all', label: 'All Products' },
    { id: 'food-beverage', label: 'Food & Beverage' },
    { id: 'textiles', label: 'Textiles' },
    { id: 'handicrafts', label: 'Handicrafts' },
    { id: 'hampers', label: 'Mixed Hampers' }
];

function OccasionLandingPage() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [occasion, setOccasion] = useState(null);
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [showFilters, setShowFilters] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Filters state
    const [filters, setFilters] = useState({
        budget: searchParams.get('budget') || '',
        quantity: searchParams.get('quantity') || '',
        recipient: searchParams.get('recipient') || '',
        productType: searchParams.get('type') || 'all',
        customization: searchParams.get('custom') === 'true',
        sort: searchParams.get('sort') || 'popular',
        collection: searchParams.get('collection') || ''
    });

    // Fetch data on mount and filter change
    useEffect(() => {
        fetchOccasionData();
        fetchCollections();
    }, [slug]);

    useEffect(() => {
        fetchProducts();
        // Update URL params
        const params = new URLSearchParams();
        if (filters.budget) params.set('budget', filters.budget);
        if (filters.quantity) params.set('quantity', filters.quantity);
        if (filters.recipient) params.set('recipient', filters.recipient);
        if (filters.productType !== 'all') params.set('type', filters.productType);
        if (filters.customization) params.set('custom', 'true');
        if (filters.sort !== 'popular') params.set('sort', filters.sort);
        if (filters.collection) params.set('collection', filters.collection);
        setSearchParams(params);
    }, [filters, slug]);

    const fetchOccasionData = async () => {
        try {
            const res = await api.get(`/api/occasions/${slug}`);
            if (res.data.success) {
                setOccasion(res.data.data);
            } else {
                // Fallback: create occasion from slug
                setOccasion({
                    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    slug: slug,
                    description: 'Discover handcrafted Northeast Indian gifts'
                });
            }
        } catch (error) {
            console.error('Error fetching occasion:', error);
            // Fallback: create occasion from slug
            setOccasion({
                name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                slug: slug,
                description: 'Discover handcrafted Northeast Indian gifts'
            });
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await api.get(`/api/occasions/${slug}/collections`);
            if (res.data.success) {
                setCollections(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const budgetFilter = budgetFilters.find(b => b.id === filters.budget);

            const res = await api.get(`/api/occasions/${slug}/products`, {
                params: {
                    ...(budgetFilter && {
                        minPrice: budgetFilter.min,
                        maxPrice: budgetFilter.max
                    }),
                    minQuantity: filters.quantity ? quantityFilters.find(q => q.id === filters.quantity)?.min : 1,
                    recipient: filters.recipient,
                    productType: filters.productType,
                    customization: filters.customization,
                    sort: filters.sort,
                    collection: filters.collection,
                    page: pagination.page,
                    limit: 24
                }
            });

            if (res.data.success) {
                setProducts(res.data.data.products);
                setPagination(res.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            // Use sample data for demo
            setProducts(getSampleProducts());
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
            quantity: '',
            recipient: '',
            productType: 'all',
            customization: false,
            sort: 'popular',
            collection: ''
        });
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.budget) count++;
        if (filters.quantity) count++;
        if (filters.recipient) count++;
        if (filters.productType !== 'all') count++;
        if (filters.customization) count++;
        if (filters.collection) count++;
        return count;
    }, [filters]);

    const occasionEmoji = {
        'diwali': '🪔',
        'wedding': '💍',
        'birthday': '🎂',
        'corporate-gifting': '🏢',
        'employee-gifts': '👔'
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Premium Fonts */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        `}
            </style>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                        <Link to="/" className="hover:text-white transition">Home</Link>
                        <span>/</span>
                        <Link to="/shop-by-occasion" className="hover:text-white transition">Shop by Occasion</Link>
                        <span>/</span>
                        <span className="text-amber-400 font-medium">{occasion?.name || 'Loading...'}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl">{occasionEmoji[slug] || '🎁'}</span>
                                <h1
                                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    {occasion?.name || 'Loading...'} Gifts
                                </h1>
                            </div>
                            <p className="text-slate-300 text-lg max-w-2xl">
                                Illuminate business relationships with authentic Northeast treasures.
                                Premium handcrafted gifts for every budget.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400">{pagination.total || '50'}+</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Products</div>
                            </div>
                            <div className="w-px h-10 bg-slate-700" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400">{collections.length || '4'}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Collections</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curated Collections */}
            {collections.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {collections.map((collection) => (
                            <motion.button
                                key={collection.id}
                                onClick={() => updateFilter('collection', collection.id)}
                                whileHover={{ y: -4 }}
                                className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all ${filters.collection === collection.id
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30'
                                    : 'bg-white hover:shadow-xl border border-slate-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-3xl">{collection.emoji}</span>
                                    {filters.collection === collection.id && (
                                        <HiCheckCircle className="w-6 h-6" />
                                    )}
                                </div>
                                <h3 className={`font-bold text-lg mb-1 ${filters.collection === collection.id ? 'text-white' : 'text-slate-800'
                                    }`}>
                                    {collection.name}
                                </h3>
                                <p className={`text-sm mb-2 ${filters.collection === collection.id ? 'text-white/80' : 'text-slate-500'
                                    }`}>
                                    {collection.description}
                                </p>
                                <div className={`flex items-center justify-between text-sm ${filters.collection === collection.id ? 'text-white/90' : 'text-slate-600'
                                    }`}>
                                    <span className="font-semibold">{collection.priceRange}</span>
                                    <span className="flex items-center gap-1">
                                        View {collection.count} <HiArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </section>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <aside className={`lg:w-72 shrink-0 ${showFilters ? '' : 'hidden lg:block'}`}>
                        <div className="lg:sticky lg:top-24 space-y-6">
                            {/* Filter Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <HiAdjustments className="w-5 h-5 text-slate-600" />
                                    <h3 className="font-bold text-slate-800">Quick Filters</h3>
                                    {activeFilterCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </div>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Budget Filter */}
                            <FilterSection title="Budget per Gift" icon="💰">
                                <div className="grid grid-cols-2 gap-2">
                                    {budgetFilters.map((budget) => (
                                        <button
                                            key={budget.id}
                                            onClick={() => updateFilter('budget', filters.budget === budget.id ? '' : budget.id)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filters.budget === budget.id
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {budget.label}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Quantity Filter */}
                            <FilterSection title="Order Quantity" icon="📦">
                                <div className="grid grid-cols-2 gap-2">
                                    {quantityFilters.map((qty) => (
                                        <button
                                            key={qty.id}
                                            onClick={() => updateFilter('quantity', filters.quantity === qty.id ? '' : qty.id)}
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${filters.quantity === qty.id
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {qty.label}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Recipient Filter */}
                            <FilterSection title="Recipient Type" icon="👥">
                                <div className="grid grid-cols-2 gap-2">
                                    {recipientFilters.map((rec) => (
                                        <button
                                            key={rec.id}
                                            onClick={() => updateFilter('recipient', filters.recipient === rec.id ? '' : rec.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${filters.recipient === rec.id
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <span>{rec.icon}</span>
                                            <span>{rec.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Product Type Filter */}
                            <FilterSection title="Product Type" icon="🎁">
                                <div className="space-y-2">
                                    {productTypeFilters.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => updateFilter('productType', type.id)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filters.productType === type.id
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <span>{type.label}</span>
                                            {filters.productType === type.id && <HiCheckCircle className="w-5 h-5" />}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Customization Toggle */}
                            <FilterSection title="Customization" icon="✏️">
                                <button
                                    onClick={() => updateFilter('customization', !filters.customization)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${filters.customization
                                        ? 'bg-amber-500 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    <span>Available with Logo</span>
                                    <div className={`w-10 h-6 rounded-full relative transition-colors ${filters.customization ? 'bg-amber-300' : 'bg-slate-300'
                                        }`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.customization ? 'left-5' : 'left-1'
                                            }`} />
                                    </div>
                                </button>
                            </FilterSection>

                            {/* Help CTA */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-xl bg-amber-100">
                                        <HiChat className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">Need Help?</h4>
                                        <p className="text-xs text-slate-500">Chat with our gift expert</p>
                                    </div>
                                </div>
                                <button className="w-full py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition">
                                    Chat Now
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-medium"
                                >
                                    <HiFilter className="w-5 h-5" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs">{activeFilterCount}</span>
                                    )}
                                </button>
                                <p className="text-slate-600">
                                    Showing <span className="font-semibold text-slate-800">{products.length}</span> products
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Sort Dropdown */}
                                <select
                                    value={filters.sort}
                                    onChange={(e) => updateFilter('sort', e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                >
                                    <option value="popular">Popular</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                    <option value="rating">Top Rated</option>
                                </select>

                                {/* View Toggle */}
                                <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow text-slate-800' : 'text-slate-400'
                                            }`}
                                    >
                                        <HiViewGrid className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-400'
                                            }`}
                                    >
                                        <HiViewList className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        {loading ? (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                                : 'grid-cols-1'
                                }`}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden border border-slate-100">
                                        <div className="aspect-square bg-slate-100" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                                            <div className="h-6 bg-slate-100 rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                                : 'grid-cols-1'
                                }`}>
                                {products.map((product, idx) => (
                                    <ProductCard
                                        key={product._id || idx}
                                        product={product}
                                        viewMode={viewMode}
                                        occasionSlug={slug}
                                        onQuickView={() => setQuickViewProduct(product)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                                <p className="text-slate-500 mb-6">Try adjusting your filters to see more results</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Bulk Order CTA */}
                        <div className="mt-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
                            </div>
                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                        Need 100+ Gifts?
                                    </h3>
                                    <p className="text-slate-300">
                                        Get custom quotes with bulk discounts, logo printing, and dedicated support.
                                    </p>
                                </div>
                                <Link
                                    to={`/bulk-quote?occasion=${slug}`}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition whitespace-nowrap"
                                >
                                    <HiDocumentText className="w-5 h-5" />
                                    Request Custom Quote
                                </Link>
                            </div>
                        </div>

                        {/* Why Northeast Gifts */}
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: '✓', title: 'Unique & Memorable', desc: 'Stand out from typical' },
                                { icon: '✓', title: 'Eco-Friendly', desc: 'ESG-aligned gifts' },
                                { icon: '✓', title: 'Support Artisans', desc: 'CSR impact' },
                                { icon: '✓', title: 'Premium Quality', desc: 'Handcrafted excellence' }
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold mb-2">
                                        {item.icon}
                                    </div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>

            {/* Quick View Modal */}
            <AnimatePresence>
                {quickViewProduct && (
                    <ProductQuickView
                        product={quickViewProduct}
                        occasion={occasion}
                        onClose={() => setQuickViewProduct(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Filter Section Component
function FilterSection({ title, icon, children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
                <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="font-semibold text-slate-700">{title}</span>
                </div>
                <HiChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Product Card Component
function ProductCard({ product, viewMode, onQuickView, occasionSlug }) {
    const hasBulkDiscount = product.bulkPricing && product.price > product.bulkPricing.tier50;

    // Check if product has a valid MongoDB ObjectId (24 hex chars)
    const isValidMongoId = product._id && /^[a-f\d]{24}$/i.test(product._id);
    const productLink = isValidMongoId ? `/products/${product._id}` : `/productlist`;

    if (viewMode === 'list') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow group"
            >
                <div className="w-48 shrink-0 relative">
                    <img
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                    {product.discount > 0 && (
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold">
                            {product.discount}% OFF
                        </div>
                    )}
                </div>
                <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{product.title}</h3>
                            {product.state && (
                                <span className="text-xs text-teal-600 font-medium">📍 {product.state}</span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">₹{product.price?.toLocaleString()}</div>
                            {hasBulkDiscount && (
                                <div className="text-xs text-amber-600 font-medium">
                                    ₹{product.bulkPricing.tier50} for 50+
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        {product.perfectFor?.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs">
                                ✓ {tag}
                            </span>
                        ))}
                        {product.customizationAvailable?.logo && (
                            <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs">
                                ✏️ Customizable
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={onQuickView}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
                        >
                            <HiEye className="w-4 h-4" /> Quick View
                        </button>
                        <Link
                            to={productLink}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
                        >
                            <HiShoppingCart className="w-4 h-4" /> View Details
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.discount > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold">
                            {product.discount}% OFF
                        </span>
                    )}
                    {hasBulkDiscount && (
                        <span className="px-2 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold">
                            Bulk Discount
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-xl bg-white/90 text-slate-600 hover:bg-white hover:text-rose-500 shadow-lg transition">
                        <HiHeart className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onQuickView}
                        className="p-2 rounded-xl bg-white/90 text-slate-600 hover:bg-white hover:text-amber-500 shadow-lg transition"
                    >
                        <HiEye className="w-5 h-5" />
                    </button>
                </div>

                {/* Perfect For Tags */}
                {product.perfectFor && product.perfectFor.length > 0 && (
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex gap-1 flex-wrap">
                            {product.perfectFor.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-2 py-1 rounded-lg bg-white/90 text-slate-700 text-[10px] font-semibold backdrop-blur-sm">
                                    ✓ {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* State */}
                {product.state && (
                    <span className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium mb-2">
                        📍 {product.state}
                    </span>
                )}

                {/* Title */}
                <h3 className="font-bold text-slate-800 line-clamp-2 min-h-[2.5rem] mb-2">
                    {product.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <HiStar
                                key={i}
                                className={`w-4 h-4 ${i < (product.rating || 4) ? 'text-amber-400' : 'text-slate-200'}`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-slate-500">({product.reviewCount || 0})</span>
                </div>

                {/* Price */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-xl font-bold text-slate-900">₹{product.price?.toLocaleString()}</div>
                        {hasBulkDiscount && (
                            <div className="text-xs text-amber-600 font-medium">
                                ₹{product.bulkPricing.tier50?.toLocaleString()} for 50+
                            </div>
                        )}
                    </div>
                    {product.customizationAvailable?.logo && (
                        <span className="text-xs text-slate-500">✏️ Customizable</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onQuickView}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                    >
                        Quick View
                    </button>
                    <Link
                        to={productLink}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition text-center"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

// Sample products for demo
function getSampleProducts() {
    return [
        {
            _id: '1',
            title: 'Assam Tea Premium Gift Hamper',
            price: 1299,
            oldprice: 1599,
            discount: 19,
            state: 'Assam',
            rating: 4.8,
            reviewCount: 24,
            images: [{ url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400' }],
            perfectFor: ['Clients', 'Employees'],
            bulkPricing: { unit: 1299, tier50: 1169, tier100: 1104, tier500: 1039 },
            customizationAvailable: { logo: true, message: true, packaging: true }
        },
        {
            _id: '2',
            title: 'Muga Silk Designer Scarf',
            price: 2499,
            oldprice: 2999,
            discount: 17,
            state: 'Assam',
            rating: 4.9,
            reviewCount: 56,
            images: [{ url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400' }],
            perfectFor: ['VIP Clients', 'Partners'],
            bulkPricing: { unit: 2499, tier50: 2249, tier100: 2124, tier500: 1999 },
            customizationAvailable: { logo: false, message: true, packaging: true }
        },
        {
            _id: '3',
            title: 'Northeast Gourmet Spices Box',
            price: 899,
            oldprice: 999,
            discount: 10,
            state: 'Meghalaya',
            rating: 4.6,
            reviewCount: 18,
            images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' }],
            perfectFor: ['Employees', 'Large Teams'],
            bulkPricing: { unit: 899, tier50: 809, tier100: 764, tier500: 719 },
            customizationAvailable: { logo: true, message: true, packaging: false }
        }
    ];
}

export default OccasionLandingPage;
