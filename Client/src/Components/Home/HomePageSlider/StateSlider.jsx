import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

// Assets
import assam from "../../../assets/newimage/asamtea.jpg";
import meghalaya from "../../../assets/newimage/megalay.jpg";
import nagalend from "../../../assets/newimage/nagalend.jpg";
import manipur from "../../../assets/newimage/manipur.jpg";
import arunachal from "../../../assets/newimage/arunachal.jpg";
import tripura from "../../../assets/newimage/tripura.jpg";

const states = [
  { name: "Assam", slug: "assam", image: assam, products: "Tea, Silk, Cane" },
  { name: "Meghalaya", slug: "meghalaya", image: meghalaya, products: "Organic Honey, Pottery" },
  { name: "Nagaland", slug: "nagaland", image: nagalend, products: "Textiles, Jewelry" },
  { name: "Manipur", slug: "manipur", image: manipur, products: "Handloom, Bamboo Weave" },
  { name: "Tripura", slug: "tripura", image: tripura, products: "Bamboo Crafts, Handloom" },
  { name: "Arunachal", slug: "arunachal-pradesh", image: arunachal, products: "Traditional Fabrics & Crafts" },
];

function StateSlider() {
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
              Heritage of North East
            </span>
            <span className="h-[1px] w-8 bg-[#d4af37]" />
          </div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-4xl text-[#332a21] tracking-tight"
          >
            Shop by State
          </h2>
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
              <SwiperSlide key={index}>
                <Link to={`/state/${state.slug}`} className="block">
                  <div className="relative h-[250px] rounded-2xl overflow-hidden group/card cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">

                    {/* Image with subtle zoom */}
                    <img
                      src={state.image}
                      alt={state.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />

                    {/* Glassmorphism Label Container */}
                    <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 transform transition-transform duration-500 group-hover/card:-translate-y-2">
                      <h3
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-xl text-white mb-1"
                      >
                        {state.name}
                      </h3>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="text-gray-200  tracking-widest uppercase font-medium text-[10px]">{state.products}</span>
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
      </div>
    </section>
  );
}

export default StateSlider;