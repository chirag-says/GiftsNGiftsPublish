import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import axios from "axios";

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
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/getcategories`
      );
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
    return null; // Keep it clean if loading or empty
  }

  return (
    <div className="!bg-white border-b border-gray-100">
      {/* Subtle Promo Header */}
      <div className="py-4 bg-gray-50">
        <h5 className="text-[11px] sm:text-[14px] tracking-wider font-medium text-gray-800 text-center">
          Celebrate Occasions with India's #1 Online Gift Store
        </h5>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Swiper
          slidesPerView={4}
          spaceBetween={16}
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            480: { slidesPerView: 5, spaceBetween: 20 },
            768: { slidesPerView: 7, spaceBetween: 24 },
            1024: { slidesPerView: 9, spaceBetween: 30 },
          }}
          className="category-swiper"
        >
          {categories.map((category, index) => (
            <SwiperSlide key={index}>
              <Link
                to="/productlist"
                state={{ category: category.categoryname }}
                className="group flex flex-col items-center"
              >
                {/* Image Container - Circular with Modern Hover */}
                <div className="relative overflow-hidden w-16 h-16 sm:w-24 sm:h-24 md:w-30 md:h-30 rounded-full border-2 border-transparent group-hover:border-gray-300 transition-all duration-500 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={getCategoryImageUrl(category)}
                      alt={category.categoryname}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Text Label */}
                <h3 className="mt-3 text-[11px] sm:text-[13px] font-semibold text-gray-700 group-hover:text-purple-700 text-center leading-tight transition-colors line-clamp-1 px-1">
                  {category.categoryname}
                </h3>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default NavCatSlider;