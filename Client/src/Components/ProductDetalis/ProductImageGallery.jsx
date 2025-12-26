import React from 'react';

/**
 * ProductImageGallery Component
 * Handles the main product image slider with thumbnails
 */
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
        <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-gray-50 to-white">
            <div className="sticky top-24">
                {/* Main Image */}
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg mb-4 group">
                    <Swiper
                        spaceBetween={0}
                        navigation={images.length > 1}
                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                        modules={[Navigation, Thumbs, Zoom]}
                        zoom={{ maxRatio: 3 }}
                        onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                        className="aspect-square"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <div className="swiper-zoom-container h-full flex items-center justify-center bg-white p-8">
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
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.discount > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                -{product.discount}% OFF
                            </span>
                        )}
                        {product.isFeatured && (
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                <HiSparkles className="w-4 h-4" /> Featured
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={onToggleWishlist}
                            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${isWishlisted
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 backdrop-blur text-gray-600 hover:bg-white'
                                }`}
                        >
                            {isWishlisted ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                        </button>
                        <button
                            type="button"
                            onClick={onShareClick}
                            aria-label="Share product"
                            className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 hover:bg-white transition-all transform hover:scale-110"
                        >
                            <HiOutlineShare className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Zoom hint */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <MdZoomIn /> Pinch to zoom
                    </div>

                    {/* Image counter */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs">
                            {activeImageIndex + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={10}
                        slidesPerView={5}
                        watchSlidesProgress={true}
                        modules={[Navigation, Thumbs, FreeMode]}
                        freeMode={true}
                        className="thumbs-swiper"
                    >
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <button
                                    type="button"
                                    tabIndex={0}
                                    aria-label={`View image ${index + 1}`}
                                    className={`aspect-square w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === index
                                        ? "border-indigo-500 shadow-lg shadow-indigo-200 scale-105"
                                        : "border-transparent hover:border-gray-300"
                                        }`}
                                >
                                    <img src={img.url || img} alt="" className="w-full h-full object-cover" />
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
