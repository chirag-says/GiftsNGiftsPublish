/**
 * Shop By Occasion - Main Landing Page
 * Premium B2B/B2C gift shopping experience
 * Industry-leading design with animations, hover effects, and responsive layout
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import {
    HiSparkles, HiGift, HiOfficeBuilding, HiHeart, HiSun,
    HiSearch, HiArrowRight, HiLightningBolt, HiStar,
    HiUserGroup, HiCake, HiBriefcase, HiHome
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

// Occasion icons mapping
const occasionIcons = {
    'diwali': '🪔',
    'new-year': '🎄',
    'christmas': '🎄',
    'client-appreciation': '🏢',
    'employee-gifts': '👔',
    'corporate-gifting': '🤝',
    'company-milestone': '🎊',
    'onboarding-kits': '🎓',
    'farewell-gifts': '👋',
    'birthday': '🎂',
    'wedding': '💍',
    'anniversary': '💝',
    'housewarming': '🏠',
    'baby-shower': '👶',
    'bihu': '🌾',
    'durga-puja': '🪔',
    'holi': '🌸',
    'festive-season': '🎋',
    'traditional-ceremony': '🎎'
};

// Trending/Featured occasions
const featuredOccasions = ['diwali', 'corporate-gifting', 'wedding', 'birthday'];

function ShopByOccasionPage() {
    const [occasions, setOccasions] = useState({ corporate: [], personal: [], seasonal: [] });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredOccasion, setHoveredOccasion] = useState(null);
    const [previewProducts, setPreviewProducts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchOccasions();
    }, []);

    const fetchOccasions = async () => {
        try {
            const res = await api.get('/api/occasions');
            if (res.data.success) {
                setOccasions(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching occasions:', error);
            // Use fallback data for demo
            setOccasions(getFallbackOccasions());
        } finally {
            setLoading(false);
        }
    };

    // Fetch preview products on hover
    const handleOccasionHover = async (slug) => {
        setHoveredOccasion(slug);
        if (!previewProducts[slug]) {
            try {
                const res = await api.get(`/api/occasions/${slug}/products?limit=3`);
                if (res.data.success) {
                    setPreviewProducts(prev => ({
                        ...prev,
                        [slug]: res.data.data.products.slice(0, 3)
                    }));
                }
            } catch (error) {
                // Silently fail for preview
            }
        }
    };

    const filteredOccasions = (category) => {
        if (!searchQuery) return occasions[category];
        return occasions[category]?.filter(occ =>
            occ.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const allFilteredOccasions = [
        ...(filteredOccasions('corporate') || []),
        ...(filteredOccasions('personal') || []),
        ...(filteredOccasions('seasonal') || [])
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/20">
            {/* Premium Google Fonts */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
          
          .occasion-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .occasion-card:hover {
            transform: translateY(-8px);
          }
          .occasion-card:hover .card-glow {
            opacity: 1;
          }
          .card-glow {
            opacity: 0;
            transition: opacity 0.4s ease;
          }
          .floating-badge {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 2s infinite;
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
            </style>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
                        <Link to="/" className="hover:text-amber-600 transition">Home</Link>
                        <span>/</span>
                        <span className="text-slate-800 font-medium">Shop by Occasion</span>
                    </nav>

                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 mb-6"
                        >
                            <HiSparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                                Northeast India's Finest Gifts
                            </span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Shop by{" "}
                            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                                Occasion
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            Find the perfect Northeast gift for every celebration.
                            Handcrafted treasures that tell a story.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative max-w-xl mx-auto"
                        >
                            <div className="relative">
                                <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="What's your occasion? (e.g., Diwali, Wedding, Birthday)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all text-slate-700 placeholder:text-slate-400"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                />
                            </div>
                            {searchQuery && allFilteredOccasions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                    {allFilteredOccasions.slice(0, 5).map((occ) => (
                                        <Link
                                            key={occ.slug}
                                            to={`/occasion/${occ.slug}`}
                                            className="flex items-center gap-3 px-5 py-3 hover:bg-amber-50 transition"
                                        >
                                            <span className="text-2xl">{occasionIcons[occ.slug] || '🎁'}</span>
                                            <span className="font-medium text-slate-700">{occ.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Category Sections */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Corporate Occasions */}
                <OccasionCategory
                    title="Corporate Occasions"
                    subtitle="Strengthen business relationships with meaningful gifts"
                    icon={<HiOfficeBuilding className="w-6 h-6" />}
                    occasions={filteredOccasions('corporate') || []}
                    gradientFrom="from-blue-500"
                    gradientTo="to-indigo-600"
                    bgColor="bg-blue-50"
                    loading={loading}
                    onHover={handleOccasionHover}
                    hoveredOccasion={hoveredOccasion}
                    previewProducts={previewProducts}
                />

                {/* Personal Occasions */}
                <OccasionCategory
                    title="Personal Occasions"
                    subtitle="Celebrate life's special moments with heartfelt gifts"
                    icon={<HiHeart className="w-6 h-6" />}
                    occasions={filteredOccasions('personal') || []}
                    gradientFrom="from-rose-500"
                    gradientTo="to-pink-600"
                    bgColor="bg-rose-50"
                    loading={loading}
                    onHover={handleOccasionHover}
                    hoveredOccasion={hoveredOccasion}
                    previewProducts={previewProducts}
                />

                {/* Seasonal & Cultural */}
                <OccasionCategory
                    title="Seasonal & Cultural"
                    subtitle="Honor traditions with authentic Northeast treasures"
                    icon={<HiSun className="w-6 h-6" />}
                    occasions={filteredOccasions('seasonal') || []}
                    gradientFrom="from-amber-500"
                    gradientTo="to-orange-600"
                    bgColor="bg-amber-50"
                    loading={loading}
                    onHover={handleOccasionHover}
                    hoveredOccasion={hoveredOccasion}
                    previewProducts={previewProducts}
                />

                {/* Gift Finder Quiz CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12">
                        {/* Decorative */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4">
                                    <HiLightningBolt className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                                        Not Sure What to Gift?
                                    </span>
                                </div>
                                <h3
                                    className="text-2xl md:text-3xl font-bold text-white mb-3"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Take Our Gift Finder Quiz
                                </h3>
                                <p className="text-slate-300 max-w-lg">
                                    Answer 5 quick questions and get personalized gift recommendations
                                    tailored to your budget, occasion, and recipient.
                                </p>
                            </div>

                            <Link
                                to="/gift-finder"
                                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all hover:scale-105"
                            >
                                <HiGift className="w-5 h-5" />
                                <span>Start Quiz</span>
                                <HiArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {[
                        { icon: '🎁', title: 'Unique & Memorable', desc: 'Stand out from typical gifts' },
                        { icon: '🌿', title: 'Eco-Friendly', desc: 'Sustainable & ESG-aligned' },
                        { icon: '🤝', title: 'Support Artisans', desc: 'Direct impact on communities' },
                        { icon: '✨', title: 'Premium Quality', desc: 'Handcrafted excellence' }
                    ].map((badge, idx) => (
                        <div
                            key={idx}
                            className="text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <span className="text-3xl mb-3 block">{badge.icon}</span>
                            <h4 className="font-semibold text-slate-800 mb-1">{badge.title}</h4>
                            <p className="text-sm text-slate-500">{badge.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}

// Occasion Category Component
function OccasionCategory({
    title, subtitle, icon, occasions, gradientFrom, gradientTo, bgColor, loading,
    onHover, hoveredOccasion, previewProducts
}) {
    if (loading) {
        return (
            <div className="mb-16">
                <div className="animate-pulse mb-8">
                    <div className="h-8 bg-slate-200 rounded-lg w-64 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-96" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (occasions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
        >
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg`}>
                    {icon}
                </div>
                <div>
                    <h2
                        className="text-2xl font-bold text-slate-800"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        {title}
                    </h2>
                    <p className="text-slate-500">{subtitle}</p>
                </div>
            </div>

            {/* Occasions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {occasions.map((occasion, idx) => (
                    <OccasionCard
                        key={occasion.slug || idx}
                        occasion={occasion}
                        gradientFrom={gradientFrom}
                        gradientTo={gradientTo}
                        bgColor={bgColor}
                        onHover={onHover}
                        isHovered={hoveredOccasion === occasion.slug}
                        previewProducts={previewProducts[occasion.slug]}
                        delay={idx * 0.05}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// Single Occasion Card
function OccasionCard({
    occasion, gradientFrom, gradientTo, bgColor, onHover, isHovered, previewProducts, delay
}) {
    const isFeatured = featuredOccasions.includes(occasion.slug);
    const icon = occasionIcons[occasion.slug] || '🎁';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
        >
            <Link
                to={`/occasion/${occasion.slug}`}
                className="occasion-card relative block h-48 md:h-56 rounded-2xl overflow-hidden group"
                onMouseEnter={() => onHover(occasion.slug)}
                onMouseLeave={() => onHover(null)}
            >
                {/* Background */}
                {occasion.image?.url ? (
                    <img
                        src={occasion.image.url}
                        alt={occasion.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className={`absolute inset-0 ${bgColor}`} />
                )}

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${gradientFrom}/70 ${gradientTo}/90 opacity-80 group-hover:opacity-90 transition-opacity`} />

                {/* Glow Effect */}
                <div className="card-glow absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />

                {/* Featured Badge */}
                {isFeatured && (
                    <div className="floating-badge absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                        <HiStar className="w-3 h-3" />
                        Trending
                    </div>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
                    <span className="text-3xl md:text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </span>
                    <h3
                        className="text-white font-bold text-lg md:text-xl mb-1"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        {occasion.name}
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">Explore Collection</span>
                        <HiArrowRight className="w-4 h-4 text-white transform translate-x-0 group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>

                {/* Preview Products on Hover */}
                <AnimatePresence>
                    {isHovered && previewProducts && previewProducts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-3 left-3 flex gap-1"
                        >
                            {previewProducts.map((product, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-lg"
                                >
                                    <img
                                        src={product.images?.[0]?.url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Link>
        </motion.div>
    );
}

// Fallback occasions for demo/development
function getFallbackOccasions() {
    return {
        corporate: [
            { name: 'Diwali', slug: 'diwali', image: { url: '' } },
            { name: 'New Year', slug: 'new-year', image: { url: '' } },
            { name: 'Client Appreciation', slug: 'client-appreciation', image: { url: '' } },
            { name: 'Employee Gifts', slug: 'employee-gifts', image: { url: '' } },
            { name: 'Corporate Gifting', slug: 'corporate-gifting', image: { url: '' } },
            { name: 'Company Milestone', slug: 'company-milestone', image: { url: '' } },
            { name: 'Onboarding Kits', slug: 'onboarding-kits', image: { url: '' } },
            { name: 'Farewell Gifts', slug: 'farewell-gifts', image: { url: '' } }
        ],
        personal: [
            { name: 'Birthday', slug: 'birthday', image: { url: '' } },
            { name: 'Wedding', slug: 'wedding', image: { url: '' } },
            { name: 'Anniversary', slug: 'anniversary', image: { url: '' } },
            { name: 'Housewarming', slug: 'housewarming', image: { url: '' } },
            { name: 'Baby Shower', slug: 'baby-shower', image: { url: '' } }
        ],
        seasonal: [
            { name: 'Bihu', slug: 'bihu', image: { url: '' } },
            { name: 'Durga Puja', slug: 'durga-puja', image: { url: '' } },
            { name: 'Holi', slug: 'holi', image: { url: '' } },
            { name: 'Festive Season', slug: 'festive-season', image: { url: '' } },
            { name: 'Traditional Ceremony', slug: 'traditional-ceremony', image: { url: '' } }
        ]
    };
}

export default ShopByOccasionPage;
