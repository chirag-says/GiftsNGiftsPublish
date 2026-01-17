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
import { MdLocalOffer, MdSecurity } from "react-icons/md";
import { BiMinus, BiPlus, BiLoaderAlt } from "react-icons/bi";

/**
 * SizeSelector Component
 * Accessible button-based size selector
 */
export const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
    <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Size</h3>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size selection">
            {sizes.map((size, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={() => onSelect(size.trim())}
                    role="radio"
                    aria-checked={selectedSize === size.trim()}
                    className={`px-4 py-2 rounded-xl border-2 font-medium transition-all text-sm hover:scale-105 ${selectedSize === size.trim()
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
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
 * Accessible quantity controls
 */
export const QuantitySelector = ({ quantity, onDecrease, onIncrease, maxStock }) => (
    <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quantity</h3>
        <div className="inline-flex items-center bg-gray-100 rounded-xl shadow-sm" role="group" aria-label="Quantity selector">
            <button
                type="button"
                onClick={onDecrease}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="p-3 hover:bg-gray-200 rounded-l-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <BiMinus className="w-5 h-5" />
            </button>
            <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center bg-white" aria-live="polite">
                {quantity}
            </span>
            <button
                type="button"
                onClick={onIncrease}
                disabled={quantity >= maxStock}
                aria-label="Increase quantity"
                className="p-3 hover:bg-gray-200 rounded-r-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <BiPlus className="w-5 h-5" />
            </button>
        </div>
        {maxStock <= 10 && maxStock > 0 && (
            <p className="text-amber-600 text-sm mt-2 animate-pulse" role="alert">
                Only {maxStock} items left in stock!
            </p>
        )}
    </div>
);

/**
 * TrustBadge Component
 */
export const TrustBadge = ({ icon, label, delay = 0 }) => (
    <div
        className="text-center group cursor-pointer"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-md">
            {icon}
        </div>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
    </div>
);

/**
 * OfferCard Component
 */
export const OfferCard = ({ offer, index }) => (
    <div
        className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HiTag className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-gray-700">{offer}</span>
    </div>
);

/**
 * ProductInfoSection Component
 * Main product information panel with price, actions, and trust badges
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
    const offers = [
        "10% off up to ₹749 on HDFC Credit Cards",
        "5% Cashback on orders above ₹2000",
        "Free Gift Wrapping on all orders",
        "Extra 5% off on prepaid orders"
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-10 flex flex-col">
            {/* Brand */}
            {product.brand && (
                <span className="inline-flex items-center gap-1.5 text-indigo-600 font-medium text-sm mb-2">
                    <HiOutlineBadgeCheck className="w-4 h-4" />
                    {product.brand}
                </span>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {product.title}
            </h1>

            {/* Rating & Views */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {reviewStats && (
                    <>
                        <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg">
                            <span className="font-bold">{reviewStats.avgRating}</span>
                            <HiStar className="w-4 h-4" />
                        </div>
                        <span className="text-gray-500">
                            {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'Rating' : 'Ratings'}
                            {reviewStats.verifiedPurchases > 0 && (
                                <span className="text-green-600 ml-2">• {reviewStats.verifiedPurchases} Verified</span>
                            )}
                        </span>
                    </>
                )}
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                        ₹{product.price?.toLocaleString()}
                    </span>
                    {product.oldprice > product.price && (
                        <>
                            <span className="text-xl sm:text-2xl text-gray-400 line-through">
                                ₹{product.oldprice?.toLocaleString()}
                            </span>
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                                {product.discount}% OFF
                            </span>
                        </>
                    )}
                </div>
                {savings > 0 && (
                    <p className="text-green-600 font-semibold text-lg animate-pulse">
                        You save ₹{savings.toLocaleString()}
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <HiOutlineShieldCheck className="w-4 h-4" /> Inclusive of all taxes
                </p>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${product.availability === "In Stock"
                    ? "bg-green-100 text-green-700"
                    : product.availability === "Low Stock"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${product.availability === "In Stock" ? "bg-green-500" :
                        product.availability === "Low Stock" ? "bg-amber-500" : "bg-red-500"
                        } animate-pulse`}></span>
                    {product.availability || "In Stock"}
                </span>
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
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                    type="button"
                    onClick={onAddToCart}
                    disabled={isAddingToCart || product.stock <= 0}
                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                            <HiShoppingCart className="w-6 h-6" />
                            Add to Cart
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onToggleWishlist}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] ${isWishlisted
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                        }`}
                >
                    {isWishlisted ? <HiHeart className="w-6 h-6" /> : <HiOutlineHeart className="w-6 h-6" />}
                    <span className="hidden sm:inline">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
            </div>

            {/* Offers */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
                <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4 text-lg">
                    <MdLocalOffer className="text-green-600 text-xl" />
                    Available Offers
                </h3>
                <div className="grid gap-3">
                    {offers.map((offer, idx) => (
                        <OfferCard key={idx} offer={offer} index={idx} />
                    ))}
                </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100">
                <TrustBadge
                    icon={<HiOutlineTruck className="w-6 h-6 text-indigo-600" />}
                    label="Free Delivery"
                    delay={0}
                />
                <TrustBadge
                    icon={<HiOutlineRefresh className="w-6 h-6 text-blue-600" />}
                    label="Easy Returns"
                    delay={100}
                />
                <TrustBadge
                    icon={<MdSecurity className="w-6 h-6 text-green-600" />}
                    label="Secure Payment"
                    delay={200}
                />
            </div>

            {/* Seller Info */}
            <div className="mt-6 text-sm text-gray-500 space-y-1">
                {product.manufacturer && <p>Sold by: <strong className="text-gray-700">{product.manufacturer}</strong></p>}
                {product.countryOfOrigin && <p>Country of Origin: <strong className="text-gray-700">{product.countryOfOrigin}</strong></p>}
            </div>
        </div>
    );
};

export default ProductInfoSection;
