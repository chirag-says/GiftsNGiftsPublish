import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import api from "../../../utils/api";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

// Dynamic image import
const stateImages = import.meta.glob('../../../assets/states/*.{png,jpg,jpeg,webp}', { eager: true });

const getStateImage = (state) => {
  if (state.image?.url) return state.image.url;

  const cleanSlug = state.slug.toLowerCase();
  const underscoreSlug = cleanSlug.replace(/-/g, '_');

  for (const path in stateImages) {
    if (path.toLowerCase().includes(`/${cleanSlug}.`) || path.toLowerCase().includes(`/${underscoreSlug}.`)) {
      return stateImages[path].default;
    }
  }

  const defaultPath = Object.keys(stateImages).find(path => path.includes('assam'));
  return defaultPath ? stateImages[defaultPath].default : '';
};
function StateSlider() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      // Fetch all states (not just northeast)
      const response = await api.get('/api/states?northeast=false');
      if (response.data.success) {
        setStates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      // Use fallback static data
      setStates([
        { name: "Assam", slug: "assam", famousFor: "Tea, Muga Silk, Cane & Bamboo" },
        { name: "Meghalaya", slug: "meghalaya", famousFor: "Organic Honey, Living Root Bridges" },
        { name: "Nagaland", slug: "nagaland", famousFor: "Naga Shawls, Tribal Jewelry" },
        { name: "Manipur", slug: "manipur", famousFor: "Longpi Pottery, Moirang Phee" },
        { name: "Tripura", slug: "tripura", famousFor: "Bamboo Crafts, Risa Textiles" },
        { name: "Sikkim", slug: "sikkim", famousFor: "Organic Products, Thangka Art" },
        { name: "Arunachal Pradesh", slug: "arunachal-pradesh", famousFor: "Tribal Textiles, Carpets" },
        { name: "Mizoram", slug: "mizoram", famousFor: "Puan Textiles, Bamboo Products" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full pt-8 px-4 md:px-8 bg-[#fdfcfb] overflow-hidden">
        <div className="max-w-8xl mx-auto px-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-12 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[250px] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full pt-8 px-4 md:px-8 bg-[#fdfcfb] overflow-hidden">
      {/* Import Fonts */}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');
      </style>

      <div className="max-w-8xl mx-auto px-10">
        {/* Elegant Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-2">
            <span className="h-[1px] w-8 bg-[#d4af37]" />
            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.4em] font-semibold">
              Crafts of India
            </span>
            <span className="h-[1px] w-8 bg-[#d4af37]" />
          </div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-4xl text-[#332a21] tracking-tight"
          >
            Shop by State
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xl">
            Discover authentic handcrafted treasures from artisans across India
          </p>
        </div>

        <div className="relative group">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={4}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            navigation={{
              nextEl: ".state-next",
              prevEl: ".state-prev",
            }}
            breakpoints={{
              0: { slidesPerView: 1.4, spaceBetween: 15 },
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 4 },
            }}
            className=""
          >
            {states.map((state, index) => (
              <SwiperSlide key={state._id || index}>
                <Link to={`/state/${state.slug}`} className="block">
                  <div className="relative h-[250px] rounded-2xl overflow-hidden group/card cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">

                    {/* Image with subtle zoom */}
                    <img
                      src={getStateImage(state)}
                      alt={state.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />

                    {/* Featured Badge */}
                    {state.isFeatured && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-[#d4af37] text-white text-[9px] uppercase tracking-wider rounded-full font-semibold">
                        Featured
                      </div>
                    )}

                    {/* Glassmorphism Label Container */}
                    <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 transform transition-transform duration-500 group-hover/card:-translate-y-2">
                      <h3
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-xl text-white mb-1"
                      >
                        {state.name}
                      </h3>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="text-gray-200 tracking-widest uppercase font-medium text-[10px] line-clamp-1">
                        {state.famousFor || state.shortDescription}
                      </span>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          className="text-[10px] text-white/80 uppercase tracking-widest font-medium"
                        >
                          {state.productCount > 0 ? `${state.productCount} Products` : 'Explore Collection'}
                        </span>
                        <span className="text-white text-lg transform transition-transform duration-300 group-hover/card:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Minimalist Custom Navigation Buttons */}
          <button className="state-prev absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#d4af37] hover:text-white disabled:hidden">
            <span className="text-xl">‹</span>
          </button>
          <button className="state-next absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#d4af37] hover:text-white disabled:hidden">
            <span className="text-xl">›</span>
          </button>
        </div>

        {/* View All States Link */}
        <div className="flex justify-center mt-8">
          <Link
            to="/states"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all transform hover:-translate-y-1"
          >
            View All States & UTs
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default StateSlider;