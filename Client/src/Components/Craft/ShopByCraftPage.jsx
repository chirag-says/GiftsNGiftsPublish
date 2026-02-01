/**
 * Shop by Craft Page
 * Browse products by craft type (Bamboo, Handloom, Pottery, etc.)
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import api from "../../utils/api";

function ShopByCraftPage() {
    const [crafts, setCrafts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCrafts();
    }, []);

    const fetchCrafts = async () => {
        try {
            const response = await api.get('/crafts');
            if (response.data.success) {
                setCrafts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching crafts:', error);
            setCrafts(getSampleCrafts());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfcfb]">
            {/* Import Fonts */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');`}
            </style>

            {/* Hero Section */}
            <section className="relative py-16 px-4 md:px-8 bg-gradient-to-br from-[#2C1A0F] via-[#3A2518] to-[#2C1A0F] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37] rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="h-[1px] w-12 bg-[#d4af37]" />
                        <span className="text-[#d4af37] text-xs uppercase tracking-[0.4em] font-semibold">
                            Explore by Tradition
                        </span>
                        <span className="h-[1px] w-12 bg-[#d4af37]" />
                    </div>

                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl md:text-5xl lg:text-6xl text-white mb-6"
                    >
                        Shop by <span className="italic text-[#d4af37]">Craft</span>
                    </h1>

                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        Each craft tells a story. Explore the diverse artisanal traditions
                        of Northeast India - from golden Muga silk to sustainable bamboo art.
                    </p>
                </div>
            </section>

            {/* Crafts Grid */}
            <section className="py-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 h-64 rounded-2xl mb-4" />
                                    <div className="bg-gray-200 h-6 rounded w-3/4 mb-2" />
                                    <div className="bg-gray-200 h-4 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {crafts.map((craft, index) => (
                                <CraftCard key={craft._id || index} craft={craft} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// Craft Card Component
function CraftCard({ craft, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Link
                to={`/craft/${craft.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl 
                    transition-all duration-500 border border-gray-100"
            >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={craft.image?.url || getDefaultCraftImage(craft.slug)}
                        alt={craft.name}
                        className="w-full h-full object-cover transition-transform duration-700 
                            group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Emoji */}
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/90 
                        flex items-center justify-center text-2xl shadow-lg">
                        {craft.emoji || '🎨'}
                    </div>

                    {/* Product Count */}
                    {craft.productCount > 0 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-white/90 rounded-full text-sm font-medium">
                            {craft.productCount} Products
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-xl text-[#332a21] mb-2 group-hover:text-[#d4af37] transition-colors"
                    >
                        {craft.name}
                    </h3>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {craft.shortDescription || craft.description}
                    </p>

                    {/* Prominent States */}
                    {craft.prominentStates?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {craft.prominentStates.slice(0, 3).map((state, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-[#f8f6f3] text-gray-600 text-xs rounded-full"
                                >
                                    {state}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">
                            Explore Collection
                        </span>
                        <span className="text-[#d4af37] group-hover:translate-x-1 transition-transform">
                            <HiArrowRight className="w-5 h-5" />
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Default images for crafts
function getDefaultCraftImage(slug) {
    const images = {
        'bamboo-cane': 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600',
        'handloom-textiles': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        'tea-organic': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
        'pottery-ceramics': 'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600',
        'jewelry-ornaments': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
        'home-decor': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'
    };
    return images[slug] || 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600';
}

// Sample crafts fallback
function getSampleCrafts() {
    return [
        {
            _id: '1',
            name: 'Bamboo & Cane',
            slug: 'bamboo-cane',
            shortDescription: 'Sustainable bamboo and cane products from Northeast',
            emoji: '🎋',
            prominentStates: ['Assam', 'Meghalaya', 'Tripura'],
            productCount: 45
        },
        {
            _id: '2',
            name: 'Handloom & Textiles',
            slug: 'handloom-textiles',
            shortDescription: 'Exquisite handwoven fabrics and traditional textiles',
            emoji: '🧵',
            prominentStates: ['Assam', 'Nagaland', 'Manipur'],
            productCount: 120
        },
        {
            _id: '3',
            name: 'Tea & Organic',
            slug: 'tea-organic',
            shortDescription: 'Premium Assam tea and organic produce',
            emoji: '🍵',
            prominentStates: ['Assam', 'Meghalaya'],
            productCount: 35
        },
        {
            _id: '4',
            name: 'Pottery & Ceramics',
            slug: 'pottery-ceramics',
            shortDescription: 'Traditional pottery including Longpi black pottery',
            emoji: '🏺',
            prominentStates: ['Manipur', 'Assam'],
            productCount: 28
        },
        {
            _id: '5',
            name: 'Jewelry & Ornaments',
            slug: 'jewelry-ornaments',
            shortDescription: 'Traditional tribal jewelry and ornaments',
            emoji: '💎',
            prominentStates: ['Nagaland', 'Arunachal Pradesh'],
            productCount: 65
        },
        {
            _id: '6',
            name: 'Home Decor',
            slug: 'home-decor',
            shortDescription: 'Handcrafted home decor items',
            emoji: '🏠',
            prominentStates: ['Assam', 'Nagaland', 'Meghalaya'],
            productCount: 80
        }
    ];
}

export default ShopByCraftPage;
