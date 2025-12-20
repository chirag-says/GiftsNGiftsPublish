// LeftComponent.jsx - Enhanced Product Image Gallery
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Navigation, Thumbs, Zoom } from "swiper/modules";
import { MdZoomIn } from "react-icons/md";

function LeftComponent({ product }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Get all images or use placeholder
  const images = product?.images?.length > 0
    ? product.images
    : [{ url: "/placeholder.png", altText: "Product placeholder" }];

  return (
    <div className="productImageContainer sticky top-24">
      {/* Main Image */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden mb-3">
        <Swiper
          spaceBetween={0}
          navigation={images.length > 1}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[Navigation, Thumbs, Zoom]}
          zoom={{ maxRatio: 2 }}
          className="mainImageSwiper"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <div
                className="swiper-zoom-container aspect-square flex items-center justify-center bg-white cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={img.url || img}
                  alt={img.altText || product?.title || `Product image ${index + 1}`}
                  className="w-full h-full object-contain max-h-[450px] transition-transform duration-300"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Zoom indicator */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <MdZoomIn size={14} />
          <span>Hover to zoom</span>
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={10}
          slidesPerView={4}
          watchSlidesProgress={true}
          modules={[Navigation, Thumbs]}
          className="thumbSwiper"
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <div
                className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeIndex === index
                    ? "border-[#7d0492] shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <img
                  src={img.url || img}
                  alt={img.altText || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Stock Badge */}
      {product?.availability && (
        <div className={`mt-4 inline-block px-3 py-1 rounded-full text-sm font-medium ${product.availability === "In Stock"
            ? "bg-green-100 text-green-700"
            : product.availability === "Low Stock"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
          {product.availability}
          {product.availability === "Low Stock" && product.stock && (
            <span className="ml-1">({product.stock} left)</span>
          )}
        </div>
      )}
    </div>
  );
}

export default LeftComponent;
