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
      setError(null);
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

  if (isLoading || error || categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-100 pb-6">

      {/* 1. Promo Header - Clean & Minimal */}
      <div className="py-2.5 bg-gray-50 border-b border-gray-100 mb-6">
        <h5 className="text-[11px] sm:text-[13px] tracking-wide font-semibold text-gray-600 text-center uppercase">
          Celebrate Occasions with India's #1 Online Gift Store
        </h5>
      </div>

      <div className="container mx-auto px-4 relative group/slider">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={16}
          slidesPerView={4}
          navigation={{
            nextEl: '.nav-cat-next',
            prevEl: '.nav-cat-prev',
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          breakpoints={{
            320: { slidesPerView: 3, spaceBetween: 12 },
            480: { slidesPerView: 4, spaceBetween: 16 },
            640: { slidesPerView: 5, spaceBetween: 20 },
            850: { slidesPerView: 7, spaceBetween: 24 },
            1100: { slidesPerView: 9, spaceBetween: 28 },
          }}
          className="!px-2 !py-2"
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index}>
              <Link
                to="/productlist"
                state={{ category: category.categoryname }}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* 2. Image Container - Gradient Ring Effect */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-200 group-hover:from-purple-500 group-hover:to-indigo-500 transition-all duration-300">
                  <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                    <img
                      src={getCategoryImageUrl(category)}
                      alt={category.categoryname}
                      className="w-full h-full object-cover rounded-full transform transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* 3. Text Label */}
                <h3 className="mt-3 text-[11px] sm:text-[13px] font-semibold text-gray-600 group-hover:text-purple-700 text-center leading-tight transition-colors line-clamp-1 px-1 capitalize">
                  {category.categoryname}
                </h3>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 4. Floating Navigation Arrows */}
        <button className="nav-cat-prev absolute top-[40%] -left-2 sm:-left-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 flex items-center justify-center transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:invisible opacity-0 group-hover/slider:opacity-100 cursor-pointer">
          <HiChevronLeft size={20} />
        </button>
        <button className="nav-cat-next absolute top-[40%] -right-2 sm:-right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 flex items-center justify-center transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:invisible opacity-0 group-hover/slider:opacity-100 cursor-pointer">
          <HiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default NavCatSlider;