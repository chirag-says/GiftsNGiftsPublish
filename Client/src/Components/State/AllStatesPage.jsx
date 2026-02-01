/**
 * All States Page
 * Browse all Indian States and Union Territories
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowLeft, HiLocationMarker, HiSearch } from "react-icons/hi";
import api from "../../utils/api";

// Dynamic image import
const stateImages = import.meta.glob('../../assets/states/*.{png,jpg,jpeg,webp}', { eager: true });

const getStateImage = (state) => {
    if (state.image?.url) return state.image.url;

    // Normalize slug to match filename conventions (assumes filenames use underscores or hyphens)
    // e.g., 'andhra-pradesh' -> matches 'andhra_pradesh.png' or 'andhra-pradesh.png'
    const cleanSlug = state.slug.toLowerCase();
    const underscoreSlug = cleanSlug.replace(/-/g, '_');

    // Search for matching image in the imported glob
    for (const path in stateImages) {
        if (path.toLowerCase().includes(`/${cleanSlug}.`) || path.toLowerCase().includes(`/${underscoreSlug}.`)) {
            return stateImages[path].default;
        }
    }

    // Default fallback (Assam)
    const defaultPath = Object.keys(stateImages).find(path => path.includes('assam'));
    return defaultPath ? stateImages[defaultPath].default : '';
};

function AllStatesPage() {
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'northeast', 'featured'

    useEffect(() => {
        fetchStates();
    }, []);

    const fetchStates = async () => {
        try {
            const response = await api.get('/api/states?northeast=false');
            if (response.data.success) {
                setStates(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStates = states.filter(state => {
        const matchesSearch = state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (state.famousFor || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'northeast') return matchesSearch && state.isNorthEast;
        if (filter === 'featured') return matchesSearch && state.isFeatured;
        return matchesSearch;
    });

    // Group states by region
    const northeastStates = filteredStates.filter(s => s.isNorthEast);
    const otherStates = filteredStates.filter(s => !s.isNorthEast);

    return (
        <div className="min-h-screen bg-[#fdfcfb]">
            {/* Import Fonts */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');`}
            </style>

            {/* Hero Section */}
            <section className="relative py-16 px-4 md:px-8 bg-gradient-to-br from-[#2C1A0F] via-[#3A2518] to-[#2C1A0F] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <div className="flex items-center justify-center gap-3 mb-4">
                        <HiLocationMarker className="w-6 h-6 text-[#d4af37]" />
                        <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
                            Explore India
                        </span>
                    </div>

                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl md:text-5xl lg:text-6xl text-white mb-4"
                    >
                        Shop by <span className="italic text-[#d4af37]">State</span>
                    </h1>

                    <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
                        Discover authentic handcrafted treasures from artisans across all 28 states and 8 union territories of India
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search states by name or craft..."
                            className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex justify-center gap-3 mt-6">
                        {[
                            { id: 'all', label: 'All States' },
                            { id: 'northeast', label: 'North East' },
                            { id: 'featured', label: 'Featured' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === tab.id
                                    ? 'bg-[#d4af37] text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* States Grid */}
            <section className="py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-[4/3] rounded-2xl mb-3" />
                                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                                    <div className="bg-gray-200 h-3 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredStates.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-2xl text-gray-400 mb-4">No states found</p>
                            <button
                                onClick={() => { setSearchQuery(''); setFilter('all'); }}
                                className="text-[#d4af37] hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Northeast States Section */}
                            {(filter === 'all' || filter === 'northeast') && northeastStates.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                            className="text-2xl text-[#332a21]"
                                        >
                                            North East India
                                        </h2>
                                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                            {northeastStates.length} States
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {northeastStates.map((state, index) => (
                                            <StateCard key={state._id} state={state} index={index} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Other States Section */}
                            {(filter === 'all') && otherStates.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                            className="text-2xl text-[#332a21]"
                                        >
                                            Other States & UTs
                                        </h2>
                                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                            {otherStates.length} States
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {otherStates.map((state, index) => (
                                            <StateCard key={state._id} state={state} index={index} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Featured filter shows all filtered */}
                            {filter === 'featured' && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredStates.map((state, index) => (
                                        <StateCard key={state._id} state={state} index={index} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Info Section */}
            <section className="py-12 px-4 md:px-8 bg-gradient-to-br from-[#f8f6f3] to-[#fdfcfb]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-2xl md:text-3xl text-[#332a21] mb-4"
                    >
                        Celebrating India's Craft Heritage
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        Each state of India has its unique craft traditions passed down through generations.
                        From the exquisite Pashmina of Kashmir to the vibrant Bandhani of Gujarat,
                        from the intricate Pattachitra of Odisha to the elegant Kanchipuram silks of Tamil Nadu —
                        explore the rich tapestry of Indian handicrafts and support local artisans.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="px-6 py-4 bg-white rounded-xl shadow-sm">
                            <p className="text-3xl font-serif text-[#d4af37]">28+</p>
                            <p className="text-gray-500 text-sm">States</p>
                        </div>
                        <div className="px-6 py-4 bg-white rounded-xl shadow-sm">
                            <p className="text-3xl font-serif text-[#d4af37]">8</p>
                            <p className="text-gray-500 text-sm">Union Territories</p>
                        </div>
                        <div className="px-6 py-4 bg-white rounded-xl shadow-sm">
                            <p className="text-3xl font-serif text-[#d4af37]">1000+</p>
                            <p className="text-gray-500 text-sm">Craft Forms</p>
                        </div>
                        <div className="px-6 py-4 bg-white rounded-xl shadow-sm">
                            <p className="text-3xl font-serif text-[#d4af37]">7M+</p>
                            <p className="text-gray-500 text-sm">Artisans</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// State Card Component
function StateCard({ state, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to={`/state/${state.slug}`}
                className="group block"
            >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                    <img
                        src={getStateImage(state)}
                        alt={state.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {state.isFeatured && (
                            <span className="px-2 py-1 bg-[#d4af37] text-white text-[9px] uppercase tracking-wider rounded-full font-semibold">
                                Featured
                            </span>
                        )}
                        {state.isNorthEast && (
                            <span className="px-2 py-1 bg-teal-500 text-white text-[9px] uppercase tracking-wider rounded-full font-semibold">
                                NE India
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-xl text-white mb-1 group-hover:text-[#d4af37] transition-colors"
                        >
                            {state.name}
                        </h3>
                        <p className="text-white/70 text-xs line-clamp-1 mb-2">
                            {state.famousFor || state.shortDescription}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-white/60 text-[10px] uppercase tracking-wider">
                                {state.productCount > 0 ? `${state.productCount} Products` : 'Explore'}
                            </span>
                            <span className="text-white text-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default AllStatesPage;
