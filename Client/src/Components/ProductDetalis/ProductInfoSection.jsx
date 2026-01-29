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
 * SizeSelector - Updated with heritage border colors
 */
export const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
    <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-[#322619] uppercase tracking-widest">Select Size</h3>
            <button className="text-xs text-[#B58D2F] hover:underline font-semibold">Size Guide</button>
        </div>
        <div className="flex flex-wrap gap-3">
            {sizes.map((size, idx) => {
                const isSelected = selectedSize === size.trim();
                return (
                    <button
                        key={idx}
                        onClick={() => onSelect(size.trim())}
                        className={`min-w-[3.5rem] h-11 px-4 rounded-full border-2 text-sm font-bold transition-all duration-300 
                            ${isSelected
                                ? 'border-[#B58D2F] bg-[#B58D2F] text-white shadow-md'
                                : 'border-[#EDE3D2] bg-white text-[#544231] hover:border-[#B58D2F]'
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
 * QuantitySelector - Matches the rounded-pill button style
 */
export const QuantitySelector = ({ quantity, onDecrease, onIncrease, maxStock }) => (
    <div className="mb-8">
        <h3 className="text-sm font-bold text-[#322619] uppercase tracking-widest mb-3">Quantity</h3>
        <div className="inline-flex items-center bg-[#F9F6F0] border-2 border-[#EDE3D2] rounded-full p-1">
            <button
                onClick={onDecrease}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition disabled:opacity-30 text-[#322619]"
            >
                <BiMinus className="w-5 h-5" />
            </button>
            <span className="px-6 font-bold text-[#322619] tabular-nums min-w-[3rem] text-center">
                {quantity}
            </span>
            <button
                onClick={onIncrease}
                disabled={quantity >= maxStock}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition disabled:opacity-30 text-[#322619]"
            >
                <BiPlus className="w-5 h-5" />
            </button>
        </div>
    </div>
);

/**
 * ProductInfoSection - Main Component
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
        <div className="p-4 sm:p-8 lg:p-10 flex flex-col max-w-2xl mx-auto lg:mx-0 bg-white">
            {/* Brand & Title */}
            <div className="mb-6">
                {product.brand && (
                    <span className="text-[#B58D2F] text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                        {product.brand}
                    </span>
                )}
                <h1 className="font-serif text-[#322619] text-3xl sm:text-3xl font-bold leading-tight mb-3">
                    {product.title}
                </h1>
                {/* Golden Line like the Banner */}
                <div className="w-20 h-1 bg-[#B58D2F] mb-4"></div>

                {/* Origin State & Occasions */}
                <div className="flex flex-wrap items-center gap-2">
                    {product.state && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-200">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {product.state}
                        </span>
                    )}
                    {product.occasions && product.occasions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {product.occasions.slice(0, 3).map((occasion, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1 bg-pink-50 text-pink-600 text-xs font-medium rounded-full border border-pink-200"
                                >
                                    {occasion}
                                </span>
                            ))}
                            {product.occasions.length > 3 && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                    +{product.occasions.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Ratings & Price Box */}
            <div className="mb-10 p-8 bg-[#F9F6F0] rounded-3xl border border-[#EDE3D2] relative overflow-hidden">
                {/* Rating Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex bg-white px-3 py-1 rounded-full shadow-sm border border-[#EDE3D2]">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <HiStar
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(reviewStats.avgRating) ? 'text-[#B58D2F]' : 'text-gray-200'}`}
                            />
                        ))}
                        <span className="ml-2 text-xs font-bold text-[#322619]">{reviewStats.avgRating}</span>
                    </div>
                    <span className="text-xs font-medium text-[#544231] underline cursor-pointer">
                        {reviewStats.totalReviews} Reviews
                    </span>
                </div>

                <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-serif font-black text-[#322619]">
                        ₹{product.price?.toLocaleString()}
                    </span>
                    {product.oldprice > product.price && (
                        <span className="text-lg text-[#544231]/50 line-through decoration-[#B58D2F]/40">
                            ₹{product.oldprice?.toLocaleString()}
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-[#544231] font-bold mt-3 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Save ₹{savings.toLocaleString()} on this handcrafted piece
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

            {/* Main Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-10">
                <button
                    onClick={onAddToCart}
                    disabled={isAddingToCart || product.stock <= 0}
                    className="sm:col-span-4 flex items-center justify-center gap-3 bg-[#B58D2F] hover:bg-[#322619] text-white h-16 rounded-full font-bold transition-all duration-500 shadow-xl shadow-[#B58D2F]/20 disabled:bg-gray-200"
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
                    onClick={onToggleWishlist}
                    className={`sm:col-span-1 flex items-center justify-center h-16 rounded-full transition-all border-2 active:scale-95 ${isWishlisted
                            ? 'bg-[#322619] border-[#322619] text-white'
                            : 'bg-white border-[#EDE3D2] text-[#322619] hover:border-[#B58D2F]'
                        }`}
                >
                    {isWishlisted ? <HiHeart className="w-7 h-7" /> : <HiOutlineHeart className="w-7 h-7" />}
                </button>
            </div>

            {/* Heritage Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-8 border-t-2 border-dashed border-[#EDE3D2]">
                <div className="flex flex-col items-center text-center gap-2">
                    <HiOutlineTruck className="w-6 h-6 text-[#B58D2F]" />
                    <p className="text-[10px] font-bold text-[#322619] uppercase">Pan India Delivery</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2 border-x border-[#EDE3D2]">
                    <HiOutlineRefresh className="w-6 h-6 text-[#B58D2F]" />
                    <p className="text-[10px] font-bold text-[#322619] uppercase">Artisan Support</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <HiOutlineShieldCheck className="w-6 h-6 text-[#B58D2F]" />
                    <p className="text-[10px] font-bold text-[#322619] uppercase">Secure Payments</p>
                </div>
            </div>
        </div>
    );
};

export default ProductInfoSection;