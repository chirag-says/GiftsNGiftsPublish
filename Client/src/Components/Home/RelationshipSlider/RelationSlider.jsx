import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from 'swiper/modules';
import { Link } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import RelationData from '../../Consone/RelationData.js';

const RelationSlider = () => (
  <section className="py-10 bg-white border-b border-gray-100">
    <div className="container mx-auto px-4 relative group/slider">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            Shop by Relationship
          </h3>
          <p className="text-sm text-gray-500 mt-1">Perfect gifts for your loved ones</p>
        </div>
        {/* Optional: View All Link could go here */}
      </div>

      <div className="relative px-2">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          slidesPerView={2} // Default mobile
          navigation={{
            nextEl: '.rel-arrow-next',
            prevEl: '.rel-arrow-prev',
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          breakpoints={{
            320: { slidesPerView: 3, spaceBetween: 15 },
            480: { slidesPerView: 4, spaceBetween: 20 },
            640: { slidesPerView: 5, spaceBetween: 24 },
            850: { slidesPerView: 6, spaceBetween: 28 },
            1100: { slidesPerView: 8, spaceBetween: 32 },
          }}
          className="!py-4"
        >
          {RelationData.map((slide, index) => (
            <SwiperSlide key={index}>
              <Link to={slide.to} className="group block text-center cursor-pointer">

                {/* Image Container - Circular with Gradient Ring */}
                <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-200 group-hover:from-purple-500 group-hover:to-indigo-500 transition-all duration-300">
                  <div className="bg-white p-[2px] rounded-full w-full h-full overflow-hidden">
                    <img
                      src={slide.url}
                      alt={slide.text}
                      className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Label */}
                <h3 className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors capitalize">
                  {slide.text}
                </h3>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Arrows */}
        <button className="rel-arrow-prev absolute top-[40%] -left-4 z-20 w-10 h-10 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 flex items-center justify-center transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:invisible opacity-0 group-hover/slider:opacity-100 cursor-pointer">
          <HiChevronLeft size={20} />
        </button>
        <button className="rel-arrow-next absolute top-[40%] -right-4 z-20 w-10 h-10 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 flex items-center justify-center transition-all duration-300 hover:bg-purple-600 hover:text-white hover:scale-110 disabled:opacity-0 disabled:invisible opacity-0 group-hover/slider:opacity-100 cursor-pointer">
          <HiChevronRight size={20} />
        </button>
      </div>
    </div>
  </section>
);

export default RelationSlider;