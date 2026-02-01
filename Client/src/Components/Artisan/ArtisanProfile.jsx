/**
 * Artisan Profile Page
 * Individual artisan story with craft process, gallery, and products
 */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HiLocationMarker, HiBadgeCheck, HiClock, HiUserGroup,
    HiHeart, HiShare, HiArrowLeft, HiPlay, HiStar
} from "react-icons/hi";
import api from "../../utils/api";

function ArtisanProfile() {
    const { slug } = useParams();
    const [artisan, setArtisan] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('story');

    useEffect(() => {
        fetchArtisan();
        fetchProducts();
    }, [slug]);

    const fetchArtisan = async () => {
        try {
            const response = await api.get(`/artisans/${slug}`);
            if (response.data.success) {
                setArtisan(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching artisan:', error);
            setArtisan(getSampleArtisan());
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/artisans/${slug}/products`);
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!artisan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Artisan not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfcfb]">
            {/* Import Fonts */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');`}
            </style>

            {/* Back Navigation */}
            <div className="bg-white border-b border-gray-100 py-4 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/artisans"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#d4af37] transition-colors"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                        <span>Back to All Artisans</span>
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Left - Image */}
                        <div className="relative group">
                            <div className="absolute -inset-4 border border-[#d4af37]/20 rounded-3xl 
                                translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 
                                transition-transform duration-700" />

                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src={artisan.profileImage?.url || '/placeholder-artisan.jpg'}
                                    alt={artisan.name}
                                    className="w-full h-[500px] object-cover"
                                />

                                {/* Video Play Button */}
                                {artisan.videoUrl && (
                                    <button className="absolute inset-0 flex items-center justify-center 
                                        bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                                            <HiPlay className="w-10 h-10 text-[#d4af37] ml-1" />
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Quote Card */}
                            {artisan.quote && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute -bottom-8 -right-4 md:-right-8 bg-white/95 backdrop-blur-md 
                                        rounded-2xl shadow-2xl p-6 md:p-8 max-w-xs border border-white/20"
                                >
                                    <div className="w-8 h-[1px] bg-[#d4af37] mb-4" />
                                    <p className="text-sm md:text-base italic text-gray-700 leading-relaxed font-serif">
                                        "{artisan.quote}"
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Right - Info */}
                        <div className="lg:pt-8">
                            {/* Certifications */}
                            {artisan.certifications?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {artisan.certifications.map((cert, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-sm rounded-full 
                                                flex items-center gap-1"
                                        >
                                            <HiBadgeCheck className="w-4 h-4" />
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Name & Craft */}
                            <h1
                                style={{ fontFamily: "'Playfair Display', serif" }}
                                className="text-4xl md:text-5xl text-[#332a21] mb-2"
                            >
                                {artisan.name}
                            </h1>
                            <p className="text-[#d4af37] text-lg mb-4">
                                {artisan.specialization || artisan.craftType}
                            </p>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-600 mb-6">
                                <HiLocationMarker className="w-5 h-5" />
                                <span>
                                    {artisan.village && `${artisan.village}, `}
                                    {artisan.district && `${artisan.district}, `}
                                    {artisan.state}
                                </span>
                            </div>

                            {/* Short Bio */}
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {artisan.shortBio}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 p-6 bg-[#f8f6f3] rounded-2xl mb-8">
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto 
                                        rounded-full bg-[#d4af37]/10 mb-2">
                                        <HiClock className="w-6 h-6 text-[#d4af37]" />
                                    </div>
                                    <p className="text-2xl font-serif text-[#332a21]">
                                        {artisan.yearsOfExperience || 20}+
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Years</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto 
                                        rounded-full bg-[#d4af37]/10 mb-2">
                                        <HiUserGroup className="w-6 h-6 text-[#d4af37]" />
                                    </div>
                                    <p className="text-2xl font-serif text-[#332a21]">
                                        {artisan.familyMembers || 4}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Family</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto 
                                        rounded-full bg-[#d4af37]/10 mb-2">
                                        <HiHeart className="w-6 h-6 text-[#d4af37]" />
                                    </div>
                                    <p className="text-2xl font-serif text-[#332a21]">
                                        {artisan.generationsInCraft || 3}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Generations</p>
                                </div>
                            </div>

                            {/* Impact Statement */}
                            {artisan.impactStatement && (
                                <div className="flex items-center gap-3 p-4 bg-[#d4af37]/10 rounded-xl mb-6">
                                    <HiStar className="w-6 h-6 text-[#d4af37] flex-shrink-0" />
                                    <p className="text-[#332a21] font-medium">{artisan.impactStatement}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <Link
                                    to={`/productlist?state=${artisan.state}`}
                                    className="flex-1 py-3 px-6 bg-[#332a21] text-white rounded-full 
                                        text-center font-medium hover:bg-[#1a1510] transition-colors"
                                >
                                    Shop {artisan.name}'s Crafts
                                </Link>
                                <button className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                                    <HiShare className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Tab Navigation */}
                    <div className="flex gap-8 border-b border-gray-200 mb-8">
                        {[
                            { id: 'story', label: 'Full Story' },
                            { id: 'process', label: 'Craft Process' },
                            { id: 'care', label: 'Care Instructions' },
                            { id: 'products', label: 'Products' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-4 text-sm font-medium transition-colors relative
                                    ${activeTab === tab.id
                                        ? 'text-[#d4af37]'
                                        : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4af37]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px]">
                        {activeTab === 'story' && (
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {artisan.fullStory || artisan.shortBio}
                                </p>
                            </div>
                        )}

                        {activeTab === 'process' && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(artisan.craftProcess || []).length > 0 ? (
                                    artisan.craftProcess.map((step, index) => (
                                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 
                                                flex items-center justify-center text-[#d4af37] font-bold mb-4">
                                                {step.step || index + 1}
                                            </div>
                                            <h4 className="text-lg font-medium text-[#332a21] mb-2">
                                                {step.title}
                                            </h4>
                                            <p className="text-gray-500 text-sm">{step.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 col-span-3">Craft process details coming soon.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'care' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {(artisan.careInstructions || []).length > 0 ? (
                                    artisan.careInstructions.map((care, index) => (
                                        <div key={index} className="bg-[#f8f6f3] p-6 rounded-xl">
                                            <h4 className="text-lg font-medium text-[#332a21] mb-2">
                                                {care.title}
                                            </h4>
                                            <p className="text-gray-600">{care.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 space-y-4">
                                        <div className="bg-[#f8f6f3] p-6 rounded-xl">
                                            <h4 className="font-medium text-[#332a21] mb-2">General Care</h4>
                                            <p className="text-gray-600">Keep away from direct sunlight and moisture.</p>
                                        </div>
                                        <div className="bg-[#f8f6f3] p-6 rounded-xl">
                                            <h4 className="font-medium text-[#332a21] mb-2">Cleaning</h4>
                                            <p className="text-gray-600">Wipe gently with a soft, dry cloth.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.length > 0 ? (
                                    products.map((product, index) => (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product._id}`}
                                            className="group"
                                        >
                                            <div className="aspect-square rounded-xl overflow-hidden mb-2">
                                                <img
                                                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <h4 className="text-sm font-medium text-[#332a21] line-clamp-2">
                                                {product.title}
                                            </h4>
                                            <p className="text-[#d4af37] font-medium">₹{product.price}</p>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-400 col-span-4">Products from this artisan coming soon.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            {artisan.gallery?.length > 0 && (
                <section className="py-12 px-4 md:px-8 bg-[#f8f6f3]">
                    <div className="max-w-7xl mx-auto">
                        <h2
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            className="text-2xl md:text-3xl text-[#332a21] mb-8 text-center"
                        >
                            Gallery
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {artisan.gallery.map((image, index) => (
                                <div key={index} className="aspect-square rounded-xl overflow-hidden">
                                    <img
                                        src={image.url}
                                        alt={image.caption || `Gallery ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-[#fdfcfb] py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="animate-pulse bg-gray-200 h-[500px] rounded-2xl" />
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="h-10 bg-gray-200 rounded w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                        <div className="h-32 bg-gray-200 rounded mt-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sample data
function getSampleArtisan() {
    return {
        name: 'Lakshmi Devi',
        slug: 'lakshmi-devi',
        profileImage: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800' },
        state: 'Assam',
        village: 'Sualkuchi',
        district: 'Kamrup',
        craftType: 'Weaving',
        specialization: 'Muga Silk Weaving',
        yearsOfExperience: 35,
        shortBio: 'Master weaver preserving the golden Muga silk tradition of Assam for three generations.',
        fullStory: 'Born into a family of weavers in Sualkuchi, the "Manchester of Assam", Lakshmi Devi learned the art of Muga silk weaving from her grandmother at the age of eight. Today, at 55, she leads a cooperative of 50 women weavers.\n\nThe golden Muga silk is unique to Assam and is known for its natural golden sheen that intensifies with every wash. Each saree takes 15-20 days to complete, with intricate motifs inspired by nature - from the delicate petals of the Kopou orchid to the majestic Rhinoceros.\n\n"When I sit at my loom, I am not just weaving threads," says Lakshmi. "I am weaving the stories of my ancestors, the dreams of my daughters, and the pride of my land."',
        quote: 'Every thread I weave carries the wisdom of my ancestors. It is not just silk; it is our identity.',
        certifications: ['GI Tag', 'Handloom Mark', 'Silk Mark'],
        familyMembers: 4,
        generationsInCraft: 3,
        impactStatement: 'Preserving 200-year-old weaving tradition',
        craftProcess: [
            { step: 1, title: 'Silk Cultivation', description: 'Muga silkworms are raised on Som and Sualu trees.' },
            { step: 2, title: 'Thread Extraction', description: 'Cocoons are carefully boiled and threads are extracted.' },
            { step: 3, title: 'Dyeing', description: 'Natural dyes from plants and minerals are used.' },
            { step: 4, title: 'Weaving', description: 'Traditional loom weaving with intricate patterns.' }
        ],
        careInstructions: [
            { title: 'Washing', description: 'Dry clean only. If hand washing, use cold water with mild soap.' },
            { title: 'Storage', description: 'Store in cotton cloth, avoid plastic. Keep away from direct sunlight.' }
        ]
    };
}

export default ArtisanProfile;
