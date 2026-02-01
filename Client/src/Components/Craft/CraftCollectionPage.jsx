/**
 * Craft Collection Page
 * Products filtered by craft type with SEO content
 */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowLeft, HiSortDescending, HiLocationMarker, HiStar, HiQuestionMarkCircle } from "react-icons/hi";
import api from "../../utils/api";

const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
];

function CraftCollectionPage() {
    const { slug } = useParams();
    const [craft, setCraft] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popular');
    const [selectedState, setSelectedState] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [showFAQs, setShowFAQs] = useState(false);

    useEffect(() => {
        fetchCraftDetails();
        fetchProducts();
    }, [slug, sortBy, selectedState]);

    const fetchCraftDetails = async () => {
        try {
            const response = await api.get(`/crafts/${slug}`);
            if (response.data.success) {
                setCraft(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching craft details:', error);
            setCraft(getFallbackCraft(slug));
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort: sortBy,
                page: pagination.page
            });
            if (selectedState) params.append('state', selectedState);

            const response = await api.get(`/crafts/${slug}/products?${params.toString()}`);
            if (response.data.success) {
                setProducts(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const craftName = craft?.name || formatCraftName(slug);

    return (
        <div className="min-h-screen bg-[#fdfcfb]">
            {/* SEO Meta Tags would be added here with react-helmet */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');`}
            </style>

            {/* Hero Section */}
            <section className="relative py-16 px-4 md:px-8 bg-gradient-to-br from-[#2C1A0F] via-[#3A2518] to-[#2C1A0F] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="relative max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-white/60 mb-6 text-sm">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <Link to="/shop-by-craft" className="hover:text-white transition-colors">Shop by Craft</Link>
                        <span>/</span>
                        <span className="text-white">{craftName}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{craft?.emoji || '🎨'}</span>
                        <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
                            Shop by Craft
                        </span>
                    </div>

                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl md:text-5xl lg:text-6xl text-white mb-4"
                    >
                        {craftName}
                    </h1>

                    <p className="text-white/70 text-lg max-w-2xl mb-8">
                        {craft?.description || `Discover authentic ${craftName.toLowerCase()} products handcrafted by Northeast Indian artisans`}
                    </p>

                    {/* Prominent States */}
                    {craft?.prominentStates?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-white/60 text-sm">Popular in:</span>
                            {craft.prominentStates.map((state, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedState(selectedState === state ? '' : state)}
                                    className={`px-4 py-2 rounded-full text-sm border transition-colors
                                        ${selectedState === state
                                            ? 'bg-[#d4af37] border-[#d4af37] text-white'
                                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                >
                                    {state}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Filters Bar */}
            <section className="py-4 px-4 md:px-8 bg-white border-b border-gray-100 sticky top-[70px] lg:top-[140px] z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <p className="text-gray-600">
                        <span className="font-medium">{pagination.total}</span> products found
                        {selectedState && <span className="text-[#d4af37]"> in {selectedState}</span>}
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <HiSortDescending className="w-5 h-5 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border-0 bg-transparent text-sm font-medium focus:ring-0 cursor-pointer"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-square rounded-xl mb-3" />
                                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                                    <div className="bg-gray-200 h-4 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-2xl text-gray-400 mb-4">No {craftName} products found</p>
                            {selectedState && (
                                <button
                                    onClick={() => setSelectedState('')}
                                    className="text-[#d4af37] hover:underline"
                                >
                                    Clear state filter
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product, index) => (
                                <ProductCard key={product._id} product={product} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SEO Content & FAQs */}
            <section className="py-12 px-4 md:px-8 bg-[#f8f6f3]">
                <div className="max-w-4xl mx-auto">
                    {/* History/Story */}
                    {craft?.history && (
                        <div className="mb-12">
                            <h2
                                style={{ fontFamily: "'Playfair Display', serif" }}
                                className="text-2xl text-[#332a21] mb-4"
                            >
                                The Story of {craftName}
                            </h2>
                            <p className="text-gray-600 leading-relaxed">{craft.history}</p>
                        </div>
                    )}

                    {/* FAQs */}
                    {craft?.faqs?.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowFAQs(!showFAQs)}
                                className="flex items-center gap-2 text-xl font-medium text-[#332a21] mb-6"
                            >
                                <HiQuestionMarkCircle className="w-6 h-6 text-[#d4af37]" />
                                Frequently Asked Questions
                            </button>

                            {showFAQs && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    {craft.faqs.map((faq, index) => (
                                        <div key={index} className="bg-white p-6 rounded-xl">
                                            <h4 className="font-medium text-[#332a21] mb-2">{faq.question}</h4>
                                            <p className="text-gray-600 text-sm">{faq.answer}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// Product Card
function ProductCard({ product, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to={`/products/${product._id}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
                <div className="relative aspect-square overflow-hidden">
                    <img
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            {product.discount}% OFF
                        </span>
                    )}
                    {product.state && (
                        <span className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 text-xs rounded-full flex items-center gap-1">
                            <HiLocationMarker className="w-3 h-3" />
                            {product.state}
                        </span>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-sm font-medium text-[#332a21] line-clamp-2 mb-2 group-hover:text-[#d4af37] transition-colors">
                        {product.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[#d4af37] font-bold">₹{product.price}</span>
                        {product.oldprice > product.price && (
                            <span className="text-gray-400 text-sm line-through">₹{product.oldprice}</span>
                        )}
                    </div>
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <HiStar className="w-4 h-4 text-yellow-400" />
                            <span>{product.rating}</span>
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

// Utility functions
function formatCraftName(slug) {
    return slug.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getFallbackCraft(slug) {
    const crafts = {
        'bamboo-cane': {
            name: 'Bamboo & Cane',
            emoji: '🎋',
            description: 'Sustainable bamboo and cane products from Northeast India',
            prominentStates: ['Assam', 'Meghalaya', 'Tripura'],
            history: 'Bamboo craftsmanship in Northeast India dates back thousands of years.',
            faqs: [
                { question: 'How to care for bamboo products?', answer: 'Keep away from direct sunlight. Wipe with damp cloth.' }
            ]
        },
        'handloom-textiles': {
            name: 'Handloom & Textiles',
            emoji: '🧵',
            description: 'Exquisite handwoven fabrics and traditional textiles',
            prominentStates: ['Assam', 'Nagaland', 'Manipur', 'Mizoram'],
            history: 'Weaving is integral to life in Northeast India.',
            faqs: []
        }
    };
    return crafts[slug] || { name: formatCraftName(slug), emoji: '🎨', prominentStates: [] };
}

export default CraftCollectionPage;
