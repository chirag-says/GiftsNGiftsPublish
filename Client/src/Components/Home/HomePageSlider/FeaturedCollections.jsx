/**
 * Featured Collections Component
 * Curated product collections like "Best of North East" and "Perfect Gifts Under ₹999"
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { HiStar, HiArrowRight } from "react-icons/hi";
import api from "../../../utils/api";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

const COLLECTIONS = [
    {
        id: 'best-of-northeast',
        title: 'Best of North East',
        subtitle: 'Top-rated authentic crafts',
        emoji: '⭐',
        filter: { isFeatured: true, rating: { $gte: 4 } }
    },
    {
        id: 'under-999',
        title: 'Perfect Gifts Under ₹999',
        subtitle: 'Thoughtful gifts for every budget',
        emoji: '💰',
        filter: { price: { $lte: 999 } }
    }
];

function FeaturedCollections() {
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Fetch featured products
            const featured = await api.get('/product/featured?limit=8');
            // Fetch budget products
            const budget = await api.get('/product/all?maxPrice=999&limit=8');

            setProducts({
                'best-of-northeast': featured.data.products || featured.data.data || [],
                'under-999': budget.data.products || budget.data.data || []
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            // Use sample products
            setProducts({
                'best-of-northeast': getSampleProducts(),
                'under-999': getSampleProducts()
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-16 px-4 md:px-8 bg-[#fdfcfb]">
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');`}
            </style>

            <div className="max-w-7xl mx-auto">
                {COLLECTIONS.map((collection, index) => (
                    <div key={collection.id} className={index > 0 ? 'mt-16' : ''}>
                        {/* Collection Header */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <span className="text-3xl">{collection.emoji}</span>
                                <div>
                                    <h2
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                        className="text-2xl md:text-3xl text-[#332a21]"
                                    >
                                        {collection.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm">{collection.subtitle}</p>
                                </div>
                            </div>
                            <Link
                                to={`/productlist?collection=${collection.id}`}
                                className="group flex items-center gap-2 text-[#d4af37] hover:underline text-sm font-medium"
                            >
                                View All
                                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Products Slider */}
                        <div className="relative group/slider">
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="bg-gray-200 aspect-square rounded-xl mb-2" />
                                            <div className="bg-gray-200 h-4 rounded w-3/4 mb-1" />
                                            <div className="bg-gray-200 h-4 rounded w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Swiper
                                    modules={[Navigation, Autoplay]}
                                    spaceBetween={16}
                                    slidesPerView={4}
                                    navigation={{
                                        nextEl: `.${collection.id}-next`,
                                        prevEl: `.${collection.id}-prev`,
                                    }}
                                    autoplay={{ delay: 5000 + index * 1000, disableOnInteraction: false }}
                                    breakpoints={{
                                        0: { slidesPerView: 2 },
                                        640: { slidesPerView: 3 },
                                        1024: { slidesPerView: 4 },
                                    }}
                                >
                                    {(products[collection.id] || []).slice(0, 8).map((product, pIndex) => (
                                        <SwiperSlide key={product._id || pIndex}>
                                            <ProductCard product={product} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}

                            {/* Navigation Arrows */}
                            <button
                                className={`${collection.id}-prev absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 
                                    w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg 
                                    text-[#333] opacity-0 group-hover/slider:opacity-100 transition-all 
                                    hover:bg-[#d4af37] hover:text-white`}
                            >
                                ‹
                            </button>
                            <button
                                className={`${collection.id}-next absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 
                                    w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg 
                                    text-[#333] opacity-0 group-hover/slider:opacity-100 transition-all 
                                    hover:bg-[#d4af37] hover:text-white`}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Product Card
function ProductCard({ product }) {
    return (
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
                    <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {product.discount}% OFF
                    </span>
                )}
            </div>
            <div className="p-3">
                <h3 className="text-sm font-medium text-[#332a21] line-clamp-2 mb-1 
                    group-hover:text-[#d4af37] transition-colors">
                    {product.title}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-[#d4af37] font-bold">₹{product.price}</span>
                    {product.oldprice > product.price && (
                        <span className="text-gray-400 text-xs line-through">₹{product.oldprice}</span>
                    )}
                </div>
                {product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <HiStar className="w-3 h-3 text-yellow-400" />
                        <span>{product.rating}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}

// Sample products fallback
function getSampleProducts() {
    return [
        { _id: '1', title: 'Premium Assam Tea Gift Box', price: 799, oldprice: 999, discount: 20, rating: 4.8, images: [{ url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300' }] },
        { _id: '2', title: 'Handwoven Muga Silk Scarf', price: 1499, oldprice: 1999, discount: 25, rating: 4.9, images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' }] },
        { _id: '3', title: 'Bamboo Desk Organizer Set', price: 649, oldprice: 799, discount: 19, rating: 4.5, images: [{ url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300' }] },
        { _id: '4', title: 'Organic Meghalaya Honey', price: 399, oldprice: 499, discount: 20, rating: 4.7, images: [{ url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300' }] },
    ];
}

export default FeaturedCollections;
