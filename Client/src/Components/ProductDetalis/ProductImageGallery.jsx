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
    <div className="p-3 sm:p-5 lg:p-10 ">
      <div className="lg:sticky lg:top-10">
        {/* Main Image */}
        <div className="relative bg-white rounded sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg mb-4 group">
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
            className="aspect-square"
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <div className="swiper-zoom-container h-full flex items-center justify-center bg-white ">
                  <img
                    src={img.url || img}
                    alt={img.altText || product.title}
                    className="max-w-full max-h-full object-contain transition-transform duration-500"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Badges */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
            {product.discount > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-[11px] sm:text-sm font-bold shadow">
                -{product.discount}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-full text-[11px] sm:text-sm font-bold shadow flex items-center gap-1">
                <HiSparkles className="w-4 h-4" /> Featured
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={
                isWishlisted
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              className={`p-2.5 sm:p-3 rounded-full shadow transition-all transform hover:scale-110 ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/90 backdrop-blur text-gray-600 hover:bg-white"
              }`}
            >
              {isWishlisted ? (
                <HiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <HiOutlineHeart className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={onShareClick}
              aria-label="Share product"
              className="p-2.5 sm:p-3 bg-white/90 backdrop-blur rounded-full shadow text-gray-600 hover:bg-white transition-all transform hover:scale-110"
            >
              <HiOutlineShare className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Zoom hint (desktop only) */}
          <div className="hidden sm:flex absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
            <MdZoomIn /> Pinch to zoom
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/60 backdrop-blur text-white px-2.5 py-1 rounded-lg text-[11px] sm:text-xs">
              {activeImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={4}
            breakpoints={{
              640: { slidesPerView: 5 },
              768: { slidesPerView: 6 },
            }}
            watchSlidesProgress
            freeMode
            modules={[Navigation, Thumbs, FreeMode]}
            className="thumbs-swiper"
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <button
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  className={`aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden border-2 transition ${
                    activeImageIndex === index
                      ? "border-indigo-500 shadow-md scale-105"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img.url || img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
