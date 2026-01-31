import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

// Assets
import wedding from "../../../assets/newimage/wedding.jpg";
import birthday from "../../../assets/newimage/birthday.png";
import fastival from "../../../assets/newimage/fastival.png";
import baby from "../../../assets/newimage/baby.png";
import anniversary from "../../../assets/newimage/anniversary.png";

const occasions = [
  { name: "Wedding", slug: "wedding", image: wedding, count: "150+ Gifts" },
  { name: "Birthday", slug: "birthday", image: birthday, count: "200+ Gifts" },
  { name: "Festival", slug: "festive-season", image: fastival, count: "300+ Gifts" },
  { name: "Baby Shower", slug: "baby-shower", image: baby, count: "120+ Items" },
  { name: "Anniversary", slug: "anniversary", image: anniversary, count: "180+ Gifts" },
];

function ShopByOccasion() {
  return (
    <section className="w-full py-10 px-4 md:px-8 bg-[#fdfcfb] overflow-hidden">
      {/* Import Premium Fonts */}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');
      </style>

      <div className="max-w-8xl px-10 mx-auto">
        {/* Elegant Header with Accents */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-2">
            <span className="h-[1px] w-8 bg-[#d4af37]" />
            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.4em] font-semibold">
              Celebrate Every Moment
            </span>
            <span className="h-[1px] w-8 bg-[#d4af37]" />
          </div>
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-4xl text-[#332a21] tracking-tight"
          >
            Shop by Occasion
          </h2>
          <Link
            to="/shop-by-occasion"
            className="mt-3 text-sm text-[#d4af37] hover:text-[#b8942d] font-medium flex items-center gap-1 transition-colors"
          >
            View All Occasions
            <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="relative group">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={4}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            navigation={{
              nextEl: ".occ-next",
              prevEl: ".occ-prev",
            }}
            breakpoints={{
              0: { slidesPerView: 1.4, spaceBetween: 15 },
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className=""
          >
            {occasions.map((item, index) => (
              <SwiperSlide key={index}>
                <Link to={`/occasion/${item.slug}`} className="relative block h-[250px] rounded-2xl overflow-hidden group/card cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">

                  {/* Image with subtle zoom */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

                  {/* Glassmorphism Content Box */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 transform transition-transform duration-500 group-hover/card:-translate-y-2">
                    <h3
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-xl text-white mb-1"
                    >
                      {item.name}
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

          {/* Minimalist Navigation Arrows */}
          <button className="occ-prev absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#d4af37] hover:text-white disabled:hidden">
            <span className="text-xl font-light">‹</span>
          </button>
          <button className="occ-next absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#d4af37] hover:text-white disabled:hidden">
            <span className="text-xl font-light">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default ShopByOccasion;