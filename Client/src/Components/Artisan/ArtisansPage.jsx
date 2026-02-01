/**
 * Artisans Page - Meet the Makers
 * Lists all artisans with filters
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiSearch, HiFilter, HiLocationMarker, HiStar, HiBadgeCheck } from "react-icons/hi";
import api from "../../utils/api";

const STATES = [
    'All States', 'Assam', 'Meghalaya', 'Nagaland', 'Manipur',
    'Mizoram', 'Arunachal Pradesh', 'Tripura', 'Sikkim'
];

const CRAFT_TYPES = [
    'All Crafts', 'Handloom & Textiles', 'Bamboo & Cane', 'Pottery & Ceramics',
    'Jewelry & Ornaments', 'Wood Carving', 'Tea Production', 'Weaving', 'Other'
];

function ArtisansPage() {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedState, setSelectedState] = useState('All States');
    const [selectedCraft, setSelectedCraft] = useState('All Crafts');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchArtisans();
        fetchStats();
    }, [selectedState, selectedCraft]);

    const fetchArtisans = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedState !== 'All States') params.append('state', selectedState);
            if (selectedCraft !== 'All Crafts') params.append('craftType', selectedCraft);
            if (search) params.append('search', search);

            const response = await api.get(`/artisans?${params.toString()}`);
            if (response.data.success) {
                setArtisans(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching artisans:', error);
            setArtisans(getSampleArtisans());
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/artisans-stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchArtisans();
    };

    return (
        <div className="min-h-screen bg-[#fdfcfb]">
            {/* Import Fonts */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');`}
            </style>

            {/* Hero Section */}
            <section className="relative py-16 px-4 md:px-8 bg-gradient-to-br from-[#2C1A0F] via-[#3A2518] to-[#2C1A0F] overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="h-[1px] w-12 bg-[#d4af37]" />
                        <span className="text-[#d4af37] text-xs uppercase tracking-[0.4em] font-semibold">
                            Their Stories, Your Gift
                        </span>
                        <span className="h-[1px] w-12 bg-[#d4af37]" />
                    </div>

                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl md:text-5xl lg:text-6xl text-white mb-6"
                    >
                        Meet the <span className="italic text-[#d4af37]">Makers</span>
                    </h1>

                    <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
                        Every gift you choose supports a living culture and the families who sustain it.
                        Discover the stories behind the crafts.
                    </p>

                    {/* Stats */}
                    {stats && (
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-serif text-[#d4af37]">
                                    {stats.totalArtisans || 500}+
                                </p>
                                <p className="text-white/60 text-sm uppercase tracking-wider">Artisans</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-serif text-[#d4af37]">
                                    {stats.statesCount || 8}
                                </p>
                                <p className="text-white/60 text-sm uppercase tracking-wider">States</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-serif text-[#d4af37]">
                                    {stats.craftTypesCount || 15}+
                                </p>
                                <p className="text-white/60 text-sm uppercase tracking-wider">Craft Types</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Filters */}
            <section className="py-8 px-4 md:px-8 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md w-full">
                            <div className="relative">
                                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search artisans by name or craft..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 
                                        focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none"
                                />
                            </div>
                        </form>

                        {/* Filter Dropdowns */}
                        <div className="flex gap-3">
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="px-4 py-3 rounded-full border border-gray-200 bg-white
                                    focus:border-[#d4af37] outline-none text-sm"
                            >
                                {STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>

                            <select
                                value={selectedCraft}
                                onChange={(e) => setSelectedCraft(e.target.value)}
                                className="px-4 py-3 rounded-full border border-gray-200 bg-white
                                    focus:border-[#d4af37] outline-none text-sm"
                            >
                                {CRAFT_TYPES.map(craft => (
                                    <option key={craft} value={craft}>{craft}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Artisans Grid */}
            <section className="py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 h-64 rounded-2xl mb-4" />
                                    <div className="bg-gray-200 h-6 rounded w-3/4 mb-2" />
                                    <div className="bg-gray-200 h-4 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : artisans.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-2xl text-gray-400 mb-4">No artisans found</p>
                            <button
                                onClick={() => {
                                    setSelectedState('All States');
                                    setSelectedCraft('All Crafts');
                                    setSearch('');
                                }}
                                className="text-[#d4af37] hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {artisans.map((artisan, index) => (
                                <ArtisanCard key={artisan._id || index} artisan={artisan} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// Artisan Card Component
function ArtisanCard({ artisan, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Link
                to={`/artisan/${artisan.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl 
                    transition-all duration-500 border border-gray-100"
            >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                    <img
                        src={artisan.profileImage?.url || '/placeholder-artisan.jpg'}
                        alt={artisan.name}
                        className="w-full h-full object-cover transition-transform duration-700 
                            group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Certifications */}
                    {artisan.certifications?.length > 0 && (
                        <div className="absolute top-4 left-4 flex gap-2">
                            {artisan.certifications.slice(0, 2).map((cert, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-[#d4af37] text-white text-xs rounded-full 
                                        flex items-center gap-1"
                                >
                                    <HiBadgeCheck className="w-3 h-3" />
                                    {cert}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* State Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                        <HiLocationMarker className="w-4 h-4" />
                        <span className="text-sm">{artisan.state}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-xl text-[#332a21] mb-1 group-hover:text-[#d4af37] transition-colors"
                    >
                        {artisan.name}
                    </h3>
                    <p className="text-[#d4af37] text-sm mb-3">{artisan.craftType || artisan.specialization}</p>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {artisan.shortBio || artisan.quote}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                            {artisan.yearsOfExperience || 20}+ Years Experience
                        </span>
                        <span className="text-[#d4af37] text-sm font-medium group-hover:translate-x-1 transition-transform">
                            View Story →
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Sample data for fallback
function getSampleArtisans() {
    return [
        {
            _id: '1',
            name: 'Lakshmi Devi',
            slug: 'lakshmi-devi',
            profileImage: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' },
            state: 'Assam',
            craftType: 'Weaving',
            specialization: 'Muga Silk Weaving',
            shortBio: 'Master weaver preserving the golden Muga silk tradition of Assam.',
            certifications: ['GI Tag', 'Silk Mark'],
            yearsOfExperience: 35
        },
        {
            _id: '2',
            name: 'Mohan Boro',
            slug: 'mohan-boro',
            profileImage: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
            state: 'Meghalaya',
            craftType: 'Bamboo & Cane',
            specialization: 'Bamboo Furniture',
            shortBio: 'Creating sustainable bamboo art from the hills of Meghalaya.',
            certifications: ['Handmade India'],
            yearsOfExperience: 25
        },
        {
            _id: '3',
            name: 'Alemla Ao',
            slug: 'alemla-ao',
            profileImage: { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400' },
            state: 'Nagaland',
            craftType: 'Handloom & Textiles',
            specialization: 'Naga Shawls',
            shortBio: 'Keeper of ancient Naga weaving patterns and tribal motifs.',
            certifications: ['GI Tag', 'Handloom Mark'],
            yearsOfExperience: 20
        }
    ];
}

export default ArtisansPage;
