import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import api from "../../../utils/api";

const NavCatSlider = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/getcategories');
      const categoryArray = Array.isArray(response.data)
        ? response.data
        : response.data.categories || [];
      setCategories(categoryArray);
    } catch (err) {
      setError("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryImageUrl = (category) => {
    let imageUrl = category.images?.[0]?.url || category.image;
    if (!imageUrl) return "/fallback-category.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "";
    return `${base}/${imageUrl.replace(/^\/+/, "")}`;
  };

  if (isLoading || error || categories.length === 0) return null;

  return (
    <div className="bg-[#faf9f6]  border-b border-[#e7ddcf] py-12">
      <div className="container mx-auto  relative group/slider">
        
         {/* Elegant Header matching ShopByOccasion */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-2">
            <span className="h-[1px] w-8 bg-[#d4af37]" />
            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.4em] font-semibold">
              Gifts for Loved Ones
            </span>
            <span className="h-[1px] w-8 bg-[#d4af37]" />
          </div>
          <h2 
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-4xl text-[#332a21] tracking-tight"
          >
            	Featured Collections
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={10}
          slidesPerView={4}
          navigation={{
            nextEl: '.nav-cat-next',
            prevEl: '.nav-cat-prev',
          }}
          breakpoints={{
            320: { slidesPerView: 3, spaceBetween: 15 },
            640: { slidesPerView: 5, spaceBetween: 20 },
            1024: { slidesPerView: 8, spaceBetween: 25 },
          }}
          className="!px-2"
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index}>
              <Link
                to="/productlist"
                state={{ category: category.categoryname }}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* 1. Medallion Container */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-500">
                  
                  {/* Inner Gold Ring (Visible on Hover) */}
                  <div className="absolute inset-0 rounded-full border border-[#d4af37]/0 group-hover:border-[#d4af37]/60 group-hover:scale-110 transition-all duration-500" />
                  
                  {/* Outer Frame */}
                  <div className="w-[90%] h-[90%] rounded-full p-[3px] bg-white border border-[#e7ddcf] group-hover:border-[#d4af37] shadow-sm transition-all duration-500 overflow-hidden">
                    <img
                      src={getCategoryImageUrl(category)}
                      alt={category.categoryname}
                      className="w-full h-full object-cover rounded-full filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Little Gold Dot Ornament */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                </div>

                {/* 2. Text Label - Serif Font */}
                <h3 className="mt-4 text-[12px] sm:text-[14px] font-serif font-medium text-[#4a3728] group-hover:text-[#d4af37] text-center tracking-wide transition-colors capitalize">
                  {category.categoryname}
                </h3>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 3. Luxury Navigation Arrows */}
        <button className="nav-cat-prev absolute top-[45%] -left-2 sm:-left-5 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm text-[#4a3728] rounded-full shadow-md border border-[#e7ddcf] flex items-center justify-center transition-all duration-300 hover:bg-[#d4af37] hover:text-white opacity-0 group-hover/slider:opacity-100 -translate-x-2 group-hover/slider:translate-x-0">
          <HiChevronLeft size={24} strokeWidth={1}/>
        </button>
        <button className="nav-cat-next absolute top-[45%] -right-2 sm:-right-5 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm text-[#4a3728] rounded-full shadow-md border border-[#e7ddcf] flex items-center justify-center transition-all duration-300 hover:bg-[#d4af37] hover:text-white opacity-0 group-hover/slider:opacity-100 translate-x-2 group-hover/slider:translate-x-0">
          <HiChevronRight size={24} strokeWidth={1} />
        </button>
      </div>
    </div>
  );
};

export default NavCatSlider;