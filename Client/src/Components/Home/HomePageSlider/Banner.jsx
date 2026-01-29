import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Images (same as yours)
import one from "../../../assets/newimage/banne.jpg";
import bannerone from "../../../assets/newimage/one.jpg";
import two from "../../../assets/newimage/unnamed.jpg";
import four from "../../../assets/newimage/four.jpg";

const slides = [
  { img: one },
  { img: bannerone },
  { img: two },
  { img: four },
];

function Banner() {
  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden rounded-2xl">

      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        speed={1200}
        slidesPerView={1}
        loop
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        className="w-full h-[55vh] md:h-[65vh] lg:h-[55vh]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">

              {/* Image */}
              <img
                src={slide.img}
                alt="North East Handicrafts"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Warm Heritage Overlay */}
              <div className="absolute inset-0 bg-[#2C1A0F]/30 z-10" />

              <div className="relative z-20 h-full flex items-center px-6 md:px-16 lg:px-24">
                <div className="max-w-4xl">

                  {/* Heading */}
                  <h1 className="font-serif text-[#F6F1E8] text-3xl md:text-5xl lg:text-6xl leading-tight mb-4 drop-shadow-lg">
                    Handcrafted Gifts from <br />
                    the Heart of North East India
                  </h1>
                  
                  {/* Golden Line - Added Here */}
                  <div className="w-24 md:w-145 h-1 bg-[#C6A75E] mb-6"></div>
          
                  {/* Subtitle */}
                  <p className="font-heritage text-[#F6F1E8] text-sm md:text-lg mb-8 max-w-xl leading-relaxed">
                    Supporting local artisans across Assam, Meghalaya, Nagaland,
                    Manipur, Mizoram, Arunachal & Tripura.
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-4">

                    {/* Gold Button */}
                    <button className="
                      bg-[#C6A75E]
                      hover:bg-[#B89645]
                      text-[#2A1A0B]
                      px-6 py-3 md:px-8
                      rounded-full
                      font-medium
                      transition-all duration-300
                      shadow-md hover:shadow-xl
                    ">
                      Shop Handcrafted Gifts
                    </button>

                    {/* Cream Button */}
                    <button className="
                      bg-[#F3EAD8]
                      hover:bg-[#FFF7EA]
                      text-[#3A2A18]
                      px-6 py-3 md:px-8
                      rounded-full
                      font-medium
                      transition-all duration-300
                      shadow-md hover:shadow-xl
                    ">
                      Meet Our Artisans
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiper arrows & dots */}
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #3A2A18 !important;
          background: #F3EAD8;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 14px;
        }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.6);
        }
        .swiper-pagination-bullet-active {
          background: #F6F1E8;
          width: 22px;
          border-radius: 10px;
        }
      `}</style>

    </div>
  );
}

export default Banner;
