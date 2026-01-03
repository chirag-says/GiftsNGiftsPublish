import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import api from '../../../utils/api';
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { AppContext } from '../../../Components/context/Appcontext';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProductSlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedin, wishlistItems, setWishlistItems, fetchWishlist } = useContext(AppContext);
  const navigate = useNavigate();

  // Function to check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  // Toggle Wishlist Handler
  const toggleWishlist = async (e, product) => {
    e.preventDefault(); // Stop navigation
    e.stopPropagation();

    if (!isLoggedin) {
      toast.info("Please login to add to wishlist");
      // navigate("/login"); // Optional: Redirect or just prompt
      return;
    }

    const inWishlist = isInWishlist(product._id);

    // Optimistic Update
    if (inWishlist) {
      setWishlistItems(prev => prev.filter(item => item._id !== product._id));
      toast.success("Removed from wishlist");
    } else {
      setWishlistItems(prev => [...prev, product]);
      toast.success("Added to wishlist");
    }

    try {
      if (inWishlist) {
        await api.delete(`/api/auth/delete-wishlist/${product._id}`);
      } else {
        await api.post('/api/auth/wishlist', { productId: product._id });
      }
      // fetchWishlist(); // Sync with server ensure consistency (optional if optimistic works well)
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist");
      fetchWishlist(); // Revert on error
    }
  };

  const getProducts = async () => {
    try {
      const url = `/api/client/productsbycategory`;
      const { data } = await api.get(url);

      if (data?.success && Array.isArray(data.categories)) {
        const filteredCategories = data.categories
          .map((cat) => ({
            category: cat.category,
            products: cat.products.filter((p) => p.approved),
          }))
          .filter((cat) => cat.products.length > 0);

        setCategories(filteredCategories);
      }
    } catch (error) {
      console.error("Error fetching products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading collections...</div>;
  if (!categories.length) return null;

  return (
    <section className="py-10 bg-gray-50">
      {categories.map((cat, idx) => (
        <div key={idx} className="container mx-auto px-4 md:px-8 mb-14 relative group/slider">

          {/* --- Header Section --- */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 capitalize">
                {cat.category}
              </h3>
              <div className="h-1 w-12 bg-purple-600 rounded-full mt-1"></div>
            </div>

            <Link
              to={`/productlist?category=${encodeURIComponent(cat.category)}`}
              className="flex items-center gap-2 text-sm font-semibold text-purple-700 bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {/* --- Slider Section --- */}
          <div className="relative">
            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                nextEl: `.arrow-next-${idx}`,
                prevEl: `.arrow-prev-${idx}`,
              }}
              breakpoints={{
                320: { slidesPerView: 1, spaceBetween: 15 },
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1280: { slidesPerView: 4, spaceBetween: 28 },
              }}
              className="!pb-12 !px-2" // Padding for shadow overflow
            >
              {cat.products.map((product) => (
                <SwiperSlide key={product._id} className="h-auto">
                  <Link to={`/products/${product._id}`} className="block h-full">

                    {/* --- Card --- */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full border border-gray-100 flex flex-col group/card relative">

                      {/* Image Container */}
                      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                        <img
                          src={product?.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image'}
                          alt={product?.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                        />

                        {/* Overlay for depth */}
                        <div className="absolute inset-0 bg-black/5 group-hover/card:bg-black/0 transition-colors"></div>

                        {/* Badges (Left) */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          {product.discount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                              {product.discount}% OFF
                            </span>
                          )}
                        </div>

                        {/* Wishlist Icon (Fixed Right, Same Size as Arrow Button) */}
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-colors ${isInWishlist(product._id)
                              ? "bg-red-50 border-red-100 text-red-500 hover:bg-red-100" // Active State
                              : "bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:bg-gray-50" // Inactive State
                              }`}
                            onClick={(e) => toggleWishlist(e, product)}
                            title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <FiHeart
                              size={18}
                              fill={isInWishlist(product._id) ? "currentColor" : "none"}
                              className={isInWishlist(product._id) ? "scale-110" : ""}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="p-5 flex flex-col flex-grow">
                        {/* Category/Brand Tag */}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                          {product.brand || "Collection"}
                        </span>

                        {/* Title */}
                        <h3 className="text-gray-900 font-bold text-[16px] leading-tight mb-2 line-clamp-2 h-10 group-hover/card:text-purple-700 transition-colors">
                          {product.title}
                        </h3>

                        {/* Price & Action */}
                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{product.price?.toLocaleString()}
                            </span>
                            {product.oldPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{product.oldPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Arrow Icon Button (Same size as Wishlist button) */}
                          <div className="w-9 h-9 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center group-hover/card:bg-purple-600 group-hover/card:text-white transition-all duration-300">
                            <FiArrowRight size={18} />
                          </div>
                        </div>
                      </div>

                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* --- Floating Navigation Arrows --- */}
            {/* Left */}
            <button
              className={`arrow-prev-${idx} absolute top-1/2 -left-4 z-20 -translate-y-1/2 w-12 h-12 bg-white text-gray-700 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center justify-center transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:invisible opacity-0 group-hover/slider:opacity-100 cursor-pointer`}
            >
              <HiChevronLeft size={24} />
            </button>

            {/* Right */}
            <button
              className={`arrow-next-${idx} absolute top-1/2 -right-4 z-20 -translate-y-1/2 w-12 h-12 bg-white text-gray-700 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center justify-center transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:invisible opacity-0 group-hover/slider:opacity-100 cursor-pointer`}
            >
              <HiChevronRight size={24} />
            </button>

          </div>
        </div>
      ))}
    </section>
  );
};

export default ProductSlider;