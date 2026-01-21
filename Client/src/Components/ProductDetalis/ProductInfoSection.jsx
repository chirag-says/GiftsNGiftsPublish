import React from 'react';
import {
    HiOutlineBadgeCheck,
    HiStar,
    HiOutlineShieldCheck,
    HiShoppingCart,
    HiOutlineHeart,
    HiHeart,
    HiOutlineTruck,
    HiOutlineRefresh,
    HiTag,
} from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import { BiMinus, BiPlus, BiLoaderAlt } from "react-icons/bi";

/**
 * SizeSelector Component
 */
export const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size selection">
            {sizes.map((size, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={() => onSelect(size.trim())}
                    role="radio"
                    aria-checked={selectedSize === size.trim()}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${selectedSize === size.trim()
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                        }`}
                >
                    {size.trim()}
                </button>
            ))}
        </div>
    </div>
);

/**
 * QuantitySelector Component
 */
export const QuantitySelector = ({ quantity, onDecrease, onIncrease, maxStock }) => (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
        <div className="inline-flex items-center border border-gray-300 rounded-md" role="group" aria-label="Quantity selector">
            <button
                type="button"
                onClick={onDecrease}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="p-2 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <BiMinus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-medium text-gray-900 min-w-[50px] text-center border-x border-gray-300" aria-live="polite">
                {quantity}
            </span>
            <button
                type="button"
                onClick={onIncrease}
                disabled={quantity >= maxStock}
                aria-label="Increase quantity"
                className="p-2 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <BiPlus className="w-4 h-4" />
            </button>
        </div>
        {maxStock <= 10 && maxStock > 0 && (
            <p className="text-orange-600 text-sm mt-2" role="alert">
                Only {maxStock} left in stock - order soon
            </p>
        )}
    </div>
);

/**
 * ProductInfoSection Component
 * Clean, professional product information panel
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
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
            {/* Brand */}
            {product.brand && (
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline mb-1">
                    {product.brand}
                </a>
            )}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-medium text-gray-900 leading-tight mb-2">
                {product.title}
            </h1>

            {/* Rating */}
            {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <HiStar
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(reviewStats.avgRating)
                                        ? 'text-amber-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                        {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'rating' : 'ratings'}
                    </span>
                </div>
            )}

            {/* Divider */}
            <hr className="border-gray-200 mb-4" />

            {/* Price Section */}
            <div className="mb-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                    {product.oldprice > product.price && (
                        <span className="text-sm text-gray-500">
                            -{product.discount}%
                        </span>
                    )}
                    <span className="text-2xl sm:text-3xl font-medium text-gray-900">
                        ₹{product.price?.toLocaleString()}
                    </span>
                </div>
                {product.oldprice > product.price && (
                    <div className="text-sm text-gray-500 mt-1">
                        M.R.P.: <span className="line-through">₹{product.oldprice?.toLocaleString()}</span>
                        {savings > 0 && (
                            <span className="text-green-600 ml-2">
                                Save ₹{savings.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    Inclusive of all taxes
                </p>
            </div>

            {/* Availability */}
            <div className="mb-4">
                {product.availability === "In Stock" ? (
                    <span className="text-green-600 text-lg font-medium">
                        In Stock
                    </span>
                ) : product.availability === "Low Stock" ? (
                    <span className="text-orange-600 font-medium">
                        Only a few left in stock
                    </span>
                ) : (
                    <span className="text-red-600 font-medium">
                        Currently unavailable
                    </span>
                )}
            </div>

            {/* Size Selection */}
            {product.size && (
                <SizeSelector
                    sizes={product.size.split(',')}
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                />
            )}

            {/* Quantity */}
            {product.stock > 0 && (
                <QuantitySelector
                    quantity={quantity}
                    onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
                    onIncrease={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    maxStock={product.stock}
                />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={isAddingToCart || product.stock <= 0}
                    className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-gray-900 py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAddingToCart ? (
                        <>
                            <BiLoaderAlt className="w-5 h-5 animate-spin" />
                            Adding...
                        </>
                    ) : product.stock <= 0 ? (
                        "Out of Stock"
                    ) : (
                        <>
                            <HiShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onToggleWishlist}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-medium transition-colors border ${isWishlisted
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {isWishlisted ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                    {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                </button>
            </div>

            {/* Product Features */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-start gap-3">
                    <HiOutlineTruck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                        <p className="text-xs text-gray-500">On orders above ₹499</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <HiOutlineRefresh className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                        <p className="text-xs text-gray-500">7-day return policy</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <HiOutlineShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                        <p className="text-xs text-gray-500">100% secure transactions</p>
                    </div>
                </div>
            </div>

            {/* Seller Info */}
            {(product.manufacturer || product.countryOfOrigin) && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm space-y-1">
                    {product.manufacturer && (
                        <p className="text-gray-600">
                            Sold by: <span className="text-blue-600 hover:underline cursor-pointer">{product.manufacturer}</span>
                        </p>
                    )}
                    {product.countryOfOrigin && (
                        <p className="text-gray-500">
                            Country of Origin: {product.countryOfOrigin}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductInfoSection;
