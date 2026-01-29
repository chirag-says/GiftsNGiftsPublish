import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { Navigation, Thumbs, Zoom, FreeMode } from "swiper/modules";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineShare,
  HiSparkles,
} from "react-icons/hi";
import { MdZoomIn } from "react-icons/md";

const ProductImageGallery = ({
  images,
  product,
  isWishlisted,
  onToggleWishlist,
  onShareClick,
  activeImageIndex,
  setActiveImageIndex,
  thumbsSwiper,
  setThumbsSwiper,
}) => {
  return (
    <div className="w-full">
      <div className="lg:sticky">
        {/* Main Image Container */}
        <div className="relative group rounded overflow-hidden bg-[#F9F6F0] border border-[#EDE3D2] transition-all duration-500 hover:shadow-2xl">
          <Swiper
            spaceBetween={0}
            navigation={images.length > 1}
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed
                  ? thumbsSwiper
                  : null,
            }}
            modules={[Navigation, Thumbs, Zoom]}
            zoom={{ maxRatio: 3 }}
            onSlideChange={(swiper) =>
              setActiveImageIndex(swiper.activeIndex)
            }
            className="aspect-square product-main-swiper"
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <div className="swiper-zoom-container h-full w-full flex items-center justify-center p-6 md:p-12">
                  <img
                    src={img.url || img}
                    alt={img.altText || product.title}
                    className="max-w-full max-h-full object-contain drop-shadow-xl"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Heritage Styled Badges */}
          <div className="absolute top-5 left-5 flex flex-col gap-2 z-30">
            {product.discount > 0 && (
              <span className="bg-[#A34343] text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-lg">
                {product.discount}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-[#B58D2F] text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-lg flex items-center gap-1.5">
                <HiSparkles className="w-3.5 h-3.5" /> Featured
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-5 right-5 flex flex-col gap-3 z-30">
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`p-3.5 rounded-full shadow-xl transition-all duration-300 transform active:scale-90 ${
                isWishlisted
                  ? "bg-[#322619] text-white"
                  : "bg-white/90 backdrop-blur text-[#322619] hover:bg-[#B58D2F] hover:text-white"
              }`}
            >
              {isWishlisted ? (
                <HiHeart className="w-5 h-5" />
              ) : (
                <HiOutlineHeart className="w-5 h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={onShareClick}
              className="p-3.5 bg-white/90 backdrop-blur rounded-full shadow-xl text-[#322619] hover:bg-[#B58D2F] hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-90"
            >
              <HiOutlineShare className="w-5 h-5" />
            </button>
          </div>

         

          {/* Counter Badge */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur text-[#322619] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest border border-[#EDE3D2] z-30 shadow-sm">
              <span className="text-[#B58D2F]">{activeImageIndex + 1}</span> / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="mt-6 px-2">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={4}
              breakpoints={{
                640: { slidesPerView: 5 },
                768: { slidesPerView: 6 },
              }}
              watchSlidesProgress
              freeMode
              modules={[Navigation, Thumbs, FreeMode]}
              className="thumbs-swiper pb-4"
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <button
                    type="button"
                    className={`aspect-square w-full rounded-2xl overflow-hidden border-2 transition-all duration-500 p-1 bg-white shadow-sm ${
                      activeImageIndex === index
                        ? "border-[#B58D2F] scale-105 shadow-md"
                        : "border-transparent hover:border-[#EDE3D2] grayscale-[0.5] hover:grayscale-0"
                    }`}
                  >
                    <img
                      src={img.url || img}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* Custom Styles for Swiper Arrows */}
      <style jsx global>{`
        .product-main-swiper .swiper-button-next,
        .product-main-swiper .swiper-button-prev {
          color: #322619 !important;
          background: rgba(255, 255, 255, 0.7);
          width: 45px;
          height: 45px;
          border-radius: 50%;
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        .product-main-swiper .swiper-button-next:after,
        .product-main-swiper .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }
        .product-main-swiper .swiper-button-next:hover,
        .product-main-swiper .swiper-button-prev:hover {
          background: #B58D2F;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default ProductImageGallery;