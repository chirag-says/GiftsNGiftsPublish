/**
 * State Collection Page
 * Products filtered by origin state (Shop by State)
 */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowLeft, HiFilter, HiSortDescending, HiLocationMarker, HiStar } from "react-icons/hi";
import api from "../../utils/api";

const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
];

function StateCollectionPage() {
    const { slug } = useParams();
    const [stateData, setStateData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('popular');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchStateDetails();
        fetchProducts();
    }, [slug, sortBy]);

    const fetchStateDetails = async () => {
        try {
            const response = await api.get(`/api/states/${slug}`);
            if (response.data.success) {
                setStateData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching state details:', error);
            // Fallback data
            setStateData(getStateFallback(slug));
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/states/${slug}/products?sort=${sortBy}&page=${pagination.page}`);
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

    const stateName = stateData?.name || formatStateName(slug);

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
                </div>

                <div className="relative max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <HiLocationMarker className="w-6 h-6 text-[#d4af37]" />
                        <span className="text-[#d4af37] text-xs uppercase tracking-[0.3em] font-semibold">
                            Shop by State
                        </span>
                    </div>

                    <h1
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-4xl md:text-5xl lg:text-6xl text-white mb-4"
                    >
                        Gifts from <span className="italic text-[#d4af37]">{stateName}</span>
                    </h1>

                    <p className="text-white/70 text-lg max-w-2xl mb-8">
                        {stateData?.description || `Discover authentic handcrafted products from the artisans of ${stateName}`}
                    </p>

                    {/* Highlights */}
                    {stateData?.highlights && (
                        <div className="flex flex-wrap gap-3">
                            {stateData.highlights.map((highlight, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20"
                                >
                                    {highlight}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mt-8 flex gap-8">
                        <div>
                            <p className="text-3xl font-serif text-[#d4af37]">{pagination.total || stateData?.productCount || 0}</p>
                            <p className="text-white/60 text-sm">Products</p>
                        </div>
                        <div>
                            <p className="text-3xl font-serif text-[#d4af37]">{stateData?.artisanCount || 0}</p>
                            <p className="text-white/60 text-sm">Artisans</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Bar */}
            <section className="py-4 px-4 md:px-8 bg-white border-b border-gray-100 sticky top-[70px] lg:top-[140px] z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <p className="text-gray-600">
                        <span className="font-medium">{pagination.total}</span> products found
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
                            <p className="text-2xl text-gray-400 mb-4">No products found from {stateName}</p>
                            <Link to="/" className="text-[#d4af37] hover:underline">
                                Browse all products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product, index) => (
                                <ProductCard key={product._id} product={product} index={index} />
                            ))}
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
                </div>
            </section>

            {/* SEO Content */}
            <section className="py-12 px-4 md:px-8 bg-[#f8f6f3]">
                <div className="max-w-4xl mx-auto prose">
                    <h2
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-2xl text-[#332a21] mb-4"
                    >
                        About {stateName} Handicrafts
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        {stateData?.description || `${stateName} is known for its rich tradition of handicrafts and artisanal products. 
                        The skilled craftspeople of this region have been preserving their cultural heritage through 
                        their intricate work for generations. Each product tells a story of dedication, skill, and 
                        artistic excellence that has been passed down through families.`}
                    </p>
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
                            {product.reviewCount > 0 && (
                                <span>({product.reviewCount})</span>
                            )}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

// Utility functions
function formatStateName(slug) {
    return slug.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function getStateFallback(slug) {
    const states = {
        // Northeast India
        'assam': { name: 'Assam', description: 'Home of the world-famous Assam tea and the exquisite golden Muga silk. Rich cultural heritage reflected in traditional crafts.', highlights: ['Muga Silk', 'Assam Tea', 'Bamboo Crafts', 'Bell Metal'] },
        'meghalaya': { name: 'Meghalaya', description: 'The "Abode of Clouds" is home to pristine organic products and unique living root bridges.', highlights: ['Organic Honey', 'Cane & Bamboo', 'Khasi Textiles'] },
        'nagaland': { name: 'Nagaland', description: 'Land of festivals featuring rich tribal heritage with distinctive shawls and jewelry.', highlights: ['Naga Shawls', 'Tribal Jewelry', 'Wood Carvings'] },
        'manipur': { name: 'Manipur', description: 'Known for elegant handloom traditions and unique black Longpi pottery.', highlights: ['Longpi Pottery', 'Moirang Phee', 'Kouna Craft'] },
        'mizoram': { name: 'Mizoram', description: 'Land of rolling hills featuring traditional Mizo Puan fabrics.', highlights: ['Puan Textiles', 'Bamboo Products', 'Cane Furniture'] },
        'arunachal-pradesh': { name: 'Arunachal Pradesh', description: 'The Land of the Rising Sun with diverse tribal cultures and crafts.', highlights: ['Monpa Carpets', 'Yak Products', 'Tribal Textiles'] },
        'tripura': { name: 'Tripura', description: 'Known for exquisite bamboo and cane work, traditional Risa textiles.', highlights: ['Bamboo Crafts', 'Risa Textile', 'Bamboo Dolls'] },
        'sikkim': { name: 'Sikkim', description: 'India\'s first fully organic state offering Himalayan treasures.', highlights: ['Organic Tea', 'Thangka Paintings', 'Large Cardamom'] },

        // Other major states
        'rajasthan': { name: 'Rajasthan', description: 'Land of kings featuring vibrant textiles, block printing, and blue pottery.', highlights: ['Block Printing', 'Blue Pottery', 'Bandhani', 'Jewelry'] },
        'jammu-and-kashmir': { name: 'Jammu and Kashmir', description: 'Paradise on Earth known for Pashmina shawls and Kashmiri carpets.', highlights: ['Pashmina Shawls', 'Kashmiri Carpets', 'Walnut Wood Carving'] },
        'kerala': { name: 'Kerala', description: 'God\'s Own Country famous for coir products and traditional Kasavu sarees.', highlights: ['Kasavu Sarees', 'Coir Products', 'Spices', 'Kathakali Masks'] },
        'gujarat': { name: 'Gujarat', description: 'Land of the White Desert featuring traditional Patola silk and Kutchi embroidery.', highlights: ['Patola Silk', 'Kutchi Embroidery', 'Bandhani'] },
        'west-bengal': { name: 'West Bengal', description: 'Cultural capital of India known for Durga Puja artistry and terracotta.', highlights: ['Baluchari Sarees', 'Terracotta', 'Dokra Craft'] },
        'tamil-nadu': { name: 'Tamil Nadu', description: 'Land of temples famous for Kanchipuram silk and Tanjore paintings.', highlights: ['Kanchipuram Silk', 'Tanjore Paintings', 'Bronze Sculptures'] },
        'maharashtra': { name: 'Maharashtra', description: 'Land of Maratha heritage featuring Paithani sarees and Kolhapuri chappals.', highlights: ['Paithani Sarees', 'Kolhapuri Chappal', 'Warli Art'] },
        'karnataka': { name: 'Karnataka', description: 'Land of sandalwood and silk featuring Mysore silk and Channapatna toys.', highlights: ['Mysore Silk', 'Sandalwood Products', 'Channapatna Toys'] },
        'uttar-pradesh': { name: 'Uttar Pradesh', description: 'Heart of India featuring Chikankari embroidery and Banarasi sarees.', highlights: ['Chikankari', 'Banarasi Sarees', 'Brassware'] },
        'madhya-pradesh': { name: 'Madhya Pradesh', description: 'Heart of India known for Chanderi silk and tribal Gond art.', highlights: ['Chanderi Silk', 'Gond Art', 'Bagh Prints'] },
        'odisha': { name: 'Odisha', description: 'Land of temples featuring Pattachitra paintings and Sambalpuri ikat.', highlights: ['Pattachitra', 'Sambalpuri Ikat', 'Silver Filigree'] },
        'andhra-pradesh': { name: 'Andhra Pradesh', description: 'Land of Kohinoor featuring Kalamkari and Kondapalli toys.', highlights: ['Kalamkari', 'Kondapalli Toys', 'Mangalagiri Cotton'] },
        'telangana': { name: 'Telangana', description: 'Land of pearls featuring Hyderabadi pearls and Bidri work.', highlights: ['Hyderabadi Pearls', 'Bidri Work', 'Pochampally Ikat'] },
        'punjab': { name: 'Punjab', description: 'Land of five rivers featuring vibrant Phulkari embroidery.', highlights: ['Phulkari', 'Punjabi Juttis', 'Paranda'] },
        'himachal-pradesh': { name: 'Himachal Pradesh', description: 'Land of gods featuring world-famous Kullu shawls.', highlights: ['Kullu Shawls', 'Chamba Rumals', 'Kangra Paintings'] },
        'uttarakhand': { name: 'Uttarakhand', description: 'Land of spirituality featuring Ringal bamboo craft and Aipan art.', highlights: ['Ringal Craft', 'Aipan Art', 'Woolen Products'] },
        'bihar': { name: 'Bihar', description: 'Ancient land of learning featuring Madhubani paintings.', highlights: ['Madhubani Art', 'Sikki Craft', 'Bhagalpuri Silk'] },
        'jharkhand': { name: 'Jharkhand', description: 'Land of forests featuring tribal Paitkar paintings.', highlights: ['Paitkar Paintings', 'Dokra Craft', 'Bamboo Products'] },
        'chhattisgarh': { name: 'Chhattisgarh', description: 'Heart of tribal India featuring Bell metal and Kosa silk.', highlights: ['Bell Metal', 'Kosa Silk', 'Bamboo Craft'] },
        'goa': { name: 'Goa', description: 'Pearl of the Orient featuring cashew products and coconut crafts.', highlights: ['Cashew Products', 'Coconut Crafts', 'Crochet Work'] },
        'ladakh': { name: 'Ladakh', description: 'Land of high passes featuring ultra-fine Ladakhi Pashmina.', highlights: ['Ladakhi Pashmina', 'Thangka Art', 'Apricot Products'] },
    };
    return states[slug] || { name: formatStateName(slug), description: '', highlights: [] };
}

export default StateCollectionPage;
