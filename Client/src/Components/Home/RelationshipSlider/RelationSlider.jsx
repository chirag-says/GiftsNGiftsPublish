import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import api from "../../../utils/api";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

const RelationSlider = () => {
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelations();
  }, []);

  const fetchRelations = async () => {
    try {
      const response = await api.get('/api/gift-for');
      if (response.data.success) {
        // Use 'all' array which is sorted by displayOrder
        setRelations(response.data.all || []);
      }
    } catch (error) {
      console.error('Error fetching relations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full px-4 md:px-8 bg-[#fdfcfb] py-12 overflow-hidden">
      {/* Import Premium Fonts */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');`}
      </style>

      <div className="max-w-8xl px-10 mx-auto">
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
            Shop by Relationship
          </h2>
        </div>

        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={4}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            navigation={{
              nextEl: ".rel-next",
              prevEl: ".rel-prev",
            }}
            breakpoints={{
              0: { slidesPerView: 1.4, spaceBetween: 15 },
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
          >
            {relations.map((relation, index) => (
              <SwiperSlide key={relation._id || index}>
                <Link
                  to={`/gift-for/${relation.slug}`}
                  className="relative block h-[250px] rounded-2xl overflow-hidden group/card cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {/* Image with subtle zoom */}
                  <img
                    src={relation.image?.url || 'https://via.placeholder.com/300x400?text=Gift'}
                    alt={relation.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

                  {/* Glassmorphism Content Box matching Reference */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 transform transition-transform duration-500 group-hover/card:-translate-y-2">
                    <h3
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-xl text-white mb-1 capitalize"
                    >
                      {relation.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        className="text-[10px] text-white/80 uppercase tracking-widest font-medium"
                      >
                        Explore Collection
                      </span>
                      <span className="text-white text-lg transform transition-transform duration-300 group-hover/card:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Minimalist Navigation Arrows matching ShopByOccasion */}
          <button className="rel-prev absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-[#333] opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#d4af37] hover:text-white disabled:hidden">
            <span className="text-xl font-light">‹</span>
          </button>
          <button className="rel-next absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-[#333] opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#d4af37] hover:text-white disabled:hidden">
            <span className="text-xl font-light">›</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RelationSlider;