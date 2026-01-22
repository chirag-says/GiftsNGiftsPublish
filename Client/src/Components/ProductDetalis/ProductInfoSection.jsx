import React from 'react';
import {
    HiStar,
    HiOutlineShieldCheck,
    HiShoppingCart,
    HiOutlineHeart,
    HiHeart,
    HiOutlineTruck,
    HiOutlineRefresh,
} from "react-icons/hi";
import { BiMinus, BiPlus, BiLoaderAlt } from "react-icons/bi";

/**
 * SizeSelector Component - Enhanced with better focus states and layout
 */
export const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
    <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Select Size</h3>
            <button className="text-xs text-indigo-600 hover:underline font-medium">Size Guide</button>
        </div>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Size selection">
            {sizes.map((size, idx) => {
                const isSelected = selectedSize === size.trim();
                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => onSelect(size.trim())}
                        role="radio"
                        aria-checked={isSelected}
                        className={`min-w-[3rem] h-11 px-4 rounded-lg border text-sm font-bold transition-all duration-200 
                            ${isSelected 
                                ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:shadow-sm'
                            }`}
                    >
                        {size.trim()}
                    </button>
                );
            })}
        </div>
    </div>
);

/**
 * QuantitySelector Component - Modern pill design
 */
export const QuantitySelector = ({ quantity, onDecrease, onIncrease, maxStock }) => (
    <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Quantity</h3>
        <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1" role="group">
            <button
                type="button"
                onClick={onDecrease}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition disabled:opacity-30"
            >
                <BiMinus className="w-4 h-4" />
            </button>
            <span className="px-6 font-bold text-gray-900 tabular-nums min-w-[3rem] text-center">
                {quantity}
            </span>
            <button
                type="button"
                onClick={onIncrease}
                disabled={quantity >= maxStock}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition disabled:opacity-30"
            >
                <BiPlus className="w-4 h-4" />
            </button>
        </div>
        {maxStock <= 10 && maxStock > 0 && (
            <p className="text-rose-600 text-xs font-medium mt-2 flex items-center gap-1" role="alert">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Only {maxStock} items left in stock
            </p>
        )}
    </div>
);

/**
 * ProductInfoSection Component
 * Clean, high-end professional product information panel
 */
const ProductInfoSection = ({
    product,
    reviewStats,
    selectedSize,
    setSelectedSize,
    quantity,
    setQuantity,
    isWishlisted,
    isAddingToCart,
    onAddToCart,
    onToggleWishlist,
}) => {
    const savings = product.oldprice - product.price;

    return (
        <div className="p-4 sm:p-8 lg:p-10 flex flex-col max-w-2xl mx-auto lg:mx-0">
            {/* Header & Title */}
            <div className="mb-6">
                {product.brand && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded mb-3">
                        {product.brand}
                    </span>
                )}
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-[1.15] tracking-tight">
                    {product.title}
                </h1>
            </div>

            {/* Ratings & Status */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                {reviewStats?.totalReviews > 0 && (
                    <div className="flex items-center gap-3 py-1 px-3 bg-amber-50 rounded-full">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <HiStar
                                    key={star}
                                    className={`w-4 h-4 ${star <= Math.round(reviewStats.avgRating) ? 'text-amber-500' : 'text-gray-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-semibold text-amber-700">
                            {reviewStats.avgRating} <span className="text-amber-400 mx-1">•</span> {reviewStats.totalReviews} Reviews
                        </span>
                    </div>
                )}
                <div className="h-4 w-[1px] bg-gray-200 hidden sm:block"></div>
                {product.availability === "In Stock" ? (
                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> In Stock
                    </span>
                ) : (
                    <span className="text-rose-600 text-sm font-bold">Currently Unavailable</span>
                )}
            </div>

            {/* Price Section */}
            <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">
                        ₹{product.price?.toLocaleString()}
                    </span>
                    {product.oldprice > product.price && (
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400 line-through font-medium">
                                ₹{product.oldprice?.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                {product.discount}% OFF
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-2 uppercase tracking-wide">
                    Inclusive of all taxes • Save ₹{savings.toLocaleString()} today
                </p>
            </div>

            {/* Selectors */}
            {product.size && (
                <SizeSelector
                    sizes={product.size.split(',')}
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                />
            )}

            {product.stock > 0 && (
                <QuantitySelector
                    quantity={quantity}
                    onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
                    onIncrease={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    maxStock={product.stock}
                />
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-10">
                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={isAddingToCart || product.stock <= 0}
                    className="sm:col-span-4 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white h-14 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isAddingToCart ? (
                        <BiLoaderAlt className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <HiShoppingCart className="w-6 h-6" />
                            {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onToggleWishlist}
                    className={`sm:col-span-1 flex items-center justify-center h-14 rounded-xl transition-all border-2 active:scale-90 ${
                        isWishlisted 
                        ? 'bg-rose-50 border-rose-200 text-rose-500' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    {isWishlisted ? <HiHeart className="w-7 h-7" /> : <HiOutlineHeart className="w-7 h-7" />}
                </button>
            </div>

            {/* Trust Badges / Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-y border-gray-100">
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-2">
                    <HiOutlineTruck className="w-6 h-6 text-indigo-500" />
                    <div>
                        <p className="text-xs font-bold text-gray-900 uppercase">Free Shipping</p>
                        <p className="text-[11px] text-gray-500">Orders over ₹499</p>
                    </div>
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-2">
                    <HiOutlineRefresh className="w-6 h-6 text-indigo-500" />
                    <div>
                        <p className="text-xs font-bold text-gray-900 uppercase">7-Day Return</p>
                        <p className="text-[11px] text-gray-500">Easy exchange</p>
                    </div>
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-2">
                    <HiOutlineShieldCheck className="w-6 h-6 text-indigo-500" />
                    <div>
                        <p className="text-xs font-bold text-gray-900 uppercase">Secure Pay</p>
                        <p className="text-[11px] text-gray-500">100% Encrypted</p>
                    </div>
                </div>
            </div>

            {/* Seller Info */}
            {(product.manufacturer || product.countryOfOrigin) && (
                <div className="mt-8 space-y-2">
                    {product.manufacturer && (
                        <p className="text-[13px] text-gray-500 italic">
                            Sold and dispatched by <span className="text-indigo-600 font-semibold not-italic hover:underline cursor-pointer">{product.manufacturer}</span>
                        </p>
                    )}
                    {product.countryOfOrigin && (
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                            Origin: {product.countryOfOrigin}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductInfoSection;