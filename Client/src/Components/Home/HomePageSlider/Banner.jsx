import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import one from "../../../assets/banner/one.jpg";
import two from "../../../assets/banner/unnamed.jpg";
import three from "../../../assets/banner/bannerone.png";
import banner from "../../../assets/banner/mainbanner.jpg";

function Banner() {
  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
      >
        <SwiperSlide>
          <img src={two} alt="Banner 2" className="w-full h-40 sm:h-45 md:h-55 lg:h-90" />
        </SwiperSlide>

        <SwiperSlide>
          <img src={banner} alt="Banner Main" className="w-full h-40 sm:h-45 md:h-55 lg:h-90" />
        </SwiperSlide>
       
       {/* <SwiperSlide>
          <img src={three} alt="Banner Main" className="w-full h-40 sm:h-45 md:h-55 lg:h-90" />
        </SwiperSlide> */}
      </Swiper>
    </div>
  );
}

export default Banner;
