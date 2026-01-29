import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import api from "../../../utils/api";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { AppContext } from "../../../Components/context/Appcontext";
import { toast } from "react-toastify";

const ProductSlider = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedin, wishlistItems, setWishlistItems, fetchWishlist } = useContext(AppContext);

  const isInWishlist = (productId) => wishlistItems.some((item) => item._id === productId);

  const toggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedin) {
      toast.info("Please login to add to wishlist");
      return;
    }
    const inWishlist = isInWishlist(product._id);
    if (inWishlist) {
      setWishlistItems((prev) => prev.filter((item) => item._id !== product._id));
      toast.success("Removed from wishlist");
    } else {
      setWishlistItems((prev) => [...prev, product]);
      toast.success("Added to wishlist");
    }
    try {
      if (inWishlist) {
        await api.delete(`/api/auth/delete-wishlist/${product._id}`);
      } else {
        await api.post("/api/auth/wishlist", { productId: product._id });
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
      fetchWishlist();
    }
  };

  const getProducts = async () => {
    try {
      const { data } = await api.get(`/api/client/productsbycategory`);
      if (data?.success && Array.isArray(data.categories)) {
        const filtered = data.categories
          .map((cat) => ({
            category: cat.category,
            products: cat.products.filter((p) => p.approved),
          }))
          .filter((cat) => cat.products.length > 0);
        setCategories(filtered);
      }
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getProducts(); }, []);

  if (loading) return (
    <div className="py-24 text-center font-serif text-[#b39055] animate-pulse tracking-widest">
      DISCOVERING TREASURES...
    </div>
  );

  return (
    <section className="py-12 md:py-20 bg-[#ffffff]">
      {categories.map((cat, idx) => (
        <div key={idx} className="max-w-[1440px] mx-auto  px-4 sm:px-6 lg:px-8 mb-10 relative group/slider">
          
          {/* HEADER SECTION */}
          <div className="flex items-end  justify-between mb-4 border-b border-[#f3eee7] pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[1px] bg-[#b39055] hidden sm:block"></span>
                <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#b39055] font-bold">
                  Curated For You
                </p>
              </div>
              <h3 className="text-2xl md:text-4xl font-serif text-[#2d2a26] capitalize">
                {cat.category}
              </h3>
            </div>

            <Link
              to="/productlist"
              state={{ category: cat.category }}
              className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.1em] uppercase text-[#2d2a26] hover:text-[#b39055] transition-all duration-300 pb-1"
            >
              Explore All <FiArrowRight className="text-lg md:text-base" />
            </Link>
          </div>

          {/* SLIDER CONTAINER */}
          <div className="relative px-1 ">
            <Swiper
              modules={[Navigation, Autoplay, FreeMode]}
              autoplay={{ delay: 5000, disableOnInteraction: true }}
              spaceBetween={16}
              slidesPerView={1.3} // Shows partial card on mobile to hint at scroll
              freeMode={true}
              navigation={{
                nextEl: `.arrow-next-${idx}`,
                prevEl: `.arrow-prev-${idx}`,
              }}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 20, freeMode: false },
                768: { slidesPerView: 2.5, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1280: { slidesPerView: 4, spaceBetween: 24 },
              }}
              className=""
            >
              {cat.products.map((product) => (
                <SwiperSlide key={product._id} >
                  <Link to={`/products/${product._id}`} className="group/card block h-full">
                    {/* <div className=" bg-amber-300 flex flex-col  transition-all duration-500"> */}
                      
                      {/* IMAGE CONTAINER */}
                     <div className="bg-white border shadow-md border-gray-100 rounded flex flex-col transition-all duration-500">

  {/* IMAGE CONTAINER */}
  <div className="relative aspect-[3/4] sm:aspect-[3/3] bg-[#faf9f7] rounded-lg overflow-hidden border border-[#f3eee7]">
    <img
      src={product?.images?.[0]?.url || "https://via.placeholder.com/400x500"}
      alt={product?.title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
    />


                        {/* DISCOUNT TAG */}
                        {product.discount > 0 && (
                          <div className="absolute top-0 left-0 bg-[#2d2a26] text-[#b39055] text-[9px] md:text-[10px] font-bold tracking-tighter px-2 md:px-3 py-1 uppercase rounded-br-lg">
                            {product.discount}% OFF
                          </div>
                        )}

                        {/* WISHLIST BUTTON */}
                        <button
                          onClick={(e) => toggleWishlist(e, product)}
                          className={`absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-md ${
                            isInWishlist(product._id)
                              ? "bg-[#b39055] text-white"
                              : "bg-white/90 text-[#2d2a26] hover:bg-[#b39055] hover:text-white"
                          }`}
                        >
                          <FiHeart size={18} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* TEXT CONTENT */}
                      <div className=" p-4 flex flex-col flex-grow">
                        <p className="text-[9px] text-center tracking-[0.2em] uppercase text-[#b39055] font-bold mb-1">
                          {product.brand || "Exclusive"}
                        </p>
                        <h4 className="font-serif text-sm text-center md:text-lg text-[#2d2a26] line-clamp-1 mb-2 group-hover/card:text-[#b39055] transition-colors">
                          {product.title}
                        </h4>
                        <div className="mt-auto flex justify-center items-center gap-2">
                          <span className="text-base !text-center md:text-xl font-serif text-[#2d2a26]">
                            ₹{product.price?.toLocaleString()}
                          </span>
                          {product.oldPrice > product.price && (
                            <span className="text-xs text-center md:text-sm text-gray-400 line-through font-light">
                              ₹{product.oldPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* NAVIGATION ARROWS - Hidden on small screens for better UX */}
            <button
              className={`arrow-prev-${idx} absolute top-[40%] -left-4 lg:-left-6 z-40 w-10 h-10 lg:w-12 lg:h-12 bg-white text-[#2d2a26] rounded-full shadow-xl border border-[#f3eee7] hidden md:flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#2d2a26] hover:text-[#b39055]`}
            >
              <HiOutlineChevronLeft size={24} />
            </button>

            <button
              className={`arrow-next-${idx} absolute top-[40%] -right-4 lg:-right-6 z-40 w-10 h-10 lg:w-12 lg:h-12 bg-white text-[#2d2a26] rounded-full shadow-xl border border-[#f3eee7] hidden md:flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#2d2a26] hover:text-[#b39055]`}
            >
              <HiOutlineChevronRight size={24} />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProductSlider;