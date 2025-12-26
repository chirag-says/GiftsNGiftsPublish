import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import {
  HiChevronLeft,
  HiChevronRight,
  HiShoppingCart,
  HiSparkles,
  HiCheck,
  HiArrowRight,
  HiOutlineBadgeCheck,
  HiTag,
  HiOutlineRefresh,
  HiShoppingBag,
} from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { FaFacebookF, FaTwitter, FaWhatsapp, FaLink } from "react-icons/fa";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext";

// Extracted Sub-Components
import ProductImageGallery from "./ProductImageGallery";
import ProductInfoSection from "./ProductInfoSection";
import ReviewList from "./ReviewList";

/**
 * ProductSkeleton Component
 * Loading state UI
 */
const ProductSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-4 sm:p-6 lg:p-10 bg-gray-50">
            <div className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-2xl mb-4"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="aspect-square w-1/5 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-10">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * ShareModal Component
 * Social sharing modal
 */
const ShareModal = ({ isOpen, onClose, product, onShare }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <div className="flex justify-between items-center mb-4">
          <h3 id="share-title" className="text-lg font-bold">Share Product</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close share dialog"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onShare('facebook')}
            className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
            aria-label="Share on Facebook"
          >
            <FaFacebookF className="w-6 h-6 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => onShare('twitter')}
            className="p-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition"
            aria-label="Share on Twitter"
          >
            <FaTwitter className="w-6 h-6 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => onShare('whatsapp')}
            className="p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp className="w-6 h-6 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => onShare('copy')}
            className="p-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
            aria-label="Copy link"
          >
            <FaLink className="w-6 h-6 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ProductDetail Component
 * 
 * ARCHITECTURAL REFACTOR:
 * - Split from 1140 lines into modular sub-components
 * - ProductImageGallery: Image slider and thumbnails
 * - ProductInfoSection: Price, actions, offers, trust badges
 * - ReviewList: Reviews stats, list, and form
 */
function ProductDetail() {
  const { id: productId } = useParams();
  const { userData, isLoggedin, fetchWishlist, wishlistItems, fetchCart } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState({ canReview: true, isVerifiedPurchase: false });
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Check wishlist status
  useEffect(() => {
    if (product?._id) {
      const inWishlist = wishlistItems?.some((item) => item._id === product._id);
      setIsWishlisted(inWishlist);
    }
  }, [wishlistItems, product]);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [productId]);

  // Fetch all data
  useEffect(() => {
    if (!productId) return;

    setLoading(true);

    Promise.all([
      api.get(`/api/products/${productId}`),
      api.get(`/api/product/reviews/${productId}`),
      api.get(`/api/product/related/${productId}`)
    ]).then(([productRes, reviewsRes, relatedRes]) => {
      setProduct(productRes.data.data || productRes.data);

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.reviews || []);
        setReviewStats(reviewsRes.data.stats);
      } else {
        setReviews(reviewsRes.data || []);
      }
      setRelatedProducts(relatedRes.data.data || []);
      setLoading(false);
    }).catch((err) => {
      if (import.meta.env.DEV) console.error("Error fetching data", err);
      setLoading(false);
    });

  }, [productId, userData]);

  // Check if user can review
  useEffect(() => {
    if (productId) {
      const userId = userData?._id;
      api.get(`/api/product/can-review`, {
        params: { productId, userId }
      })
        .then((res) => setCanReview(res.data))
        .catch((err) => {
          if (import.meta.env.DEV) console.error("Error checking review eligibility", err);
        });
    }
  }, [productId, userData]);

  const fetchReviews = () => {
    api.get(`/api/product/reviews/${productId}`)
      .then((res) => {
        if (res.data.success) {
          setReviews(res.data.reviews || []);
          setReviewStats(res.data.stats);
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.error("Error loading reviews:", err);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newRating) {
      toast.error("Please select a rating");
      return;
    }

    if (!isLoggedin) {
      toast.warning("Please login to submit a review");
      navigate("/login", { state: { from: location } });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post(`/api/product/review`, {
        productId,
        userId: userData?._id,
        userName: userData?.name || "Anonymous",
        rating: newRating,
        comment: newComment,
        title: reviewTitle
      });

      if (res.data.success) {
        toast.success(res.data.message || "Review submitted!");
        setNewComment("");
        setNewRating(5);
        setReviewTitle("");
        fetchReviews();
        setCanReview({ canReview: false, reason: "You have already reviewed this product" });
      } else {
        toast.error(res.data.error || "Failed to submit review");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedin) {
      toast.warning("Please login to manage wishlist");
      navigate("/login", { state: { from: location } });
      return;
    }

    const wasWishlisted = isWishlisted;
    setIsWishlisted(!wasWishlisted);

    try {
      if (wasWishlisted) {
        await api.delete(`/api/auth/delete-wishlist/${product._id}`);
        toast.success("Removed from wishlist");
      } else {
        await api.post(`/api/auth/wishlist`, { productId: product._id });
        toast.success("Added to wishlist");
      }
      fetchWishlist();
    } catch (error) {
      setIsWishlisted(wasWishlisted);
      if (import.meta.env.DEV) console.error("Wishlist operation failed:", error);
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedin) {
      toast.warning("Please login to add to cart");
      navigate("/login", { state: { from: location } });
      return;
    }

    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setIsAddingToCart(true);

    try {
      await api.post(
        `/api/auth/Cart`,
        { productId: product._id, quantity }
      );
      toast.success("Added to cart!");
      if (fetchCart) fetchCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing product: ${product.title}`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text} ${url}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        return;
    }

    window.open(shareUrl, '_blank');
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center max-w-md px-6">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
            <HiShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Product Not Found</h2>
          <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105"
          >
            Continue Shopping
            <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: "/placeholder.png" }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="p-2">
            <HiChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-sm font-medium truncate flex-1 px-3">{product.title}</h1>
          <button type="button" className="p-2" aria-label="View cart">
            <HiShoppingBag className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-indigo-600 transition whitespace-nowrap">Home</Link>
            <span className="whitespace-nowrap" aria-hidden="true">/</span>
            <Link to="/products" className="hover:text-indigo-600 transition whitespace-nowrap">Products</Link>
            <span className="whitespace-nowrap" aria-hidden="true">/</span>
            <span className="text-gray-800 font-medium truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left - Image Gallery */}
            <ProductImageGallery
              images={images}
              product={product}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleToggleWishlist}
              onShareClick={() => setIsShareModalOpen(true)}
              activeImageIndex={activeImageIndex}
              setActiveImageIndex={setActiveImageIndex}
              thumbsSwiper={thumbsSwiper}
              setThumbsSwiper={setThumbsSwiper}
            />

            {/* Right - Product Info */}
            <ProductInfoSection
              product={product}
              reviewStats={reviewStats}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              quantity={quantity}
              setQuantity={setQuantity}
              isWishlisted={isWishlisted}
              isAddingToCart={isAddingToCart}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto" role="tablist">
            {["Description", "Specifications", "Reviews"].map((tab, idx) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === idx}
                aria-controls={`tabpanel-${idx}`}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 min-w-[120px] py-4 px-6 font-semibold text-center transition-all relative ${activeTab === idx
                  ? "text-indigo-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {tab}
                {tab === "Reviews" && reviewStats && (
                  <span className="ml-1 text-sm text-gray-400">({reviewStats.totalReviews})</span>
                )}
                {activeTab === idx && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-10">
            {/* Description */}
            {activeTab === 0 && (
              <div className="prose max-w-none" role="tabpanel" id="tabpanel-0">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <HiSparkles className="text-indigo-600" />
                    About this product
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {showFullDescription
                      ? product.description
                      : `${product.description?.substring(0, 300)}${product.description?.length > 300 ? '...' : ''}`
                    }
                  </p>
                  {product.description?.length > 300 && (
                    <button
                      type="button"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700 transition flex items-center gap-1"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                      <HiArrowRight className={`w-4 h-4 transform transition-transform ${showFullDescription ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>

                {product.aboutThisItem && (
                  <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                    <h4 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <HiCheck className="text-blue-600" />
                      Key Features
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">{product.aboutThisItem}</p>
                  </div>
                )}

                {product.careInstructions && (
                  <div className="bg-amber-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <HiOutlineRefresh className="text-amber-600" />
                      Care Instructions
                    </h4>
                    <p className="text-gray-600">{product.careInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {activeTab === 1 && (
              <div className="grid md:grid-cols-2 gap-6" role="tabpanel" id="tabpanel-1">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <HiOutlineBadgeCheck className="text-indigo-600" />
                    Product Details
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Brand", value: product.brand },
                      { label: "Size", value: product.size },
                      { label: "Material", value: product.materialComposition },
                      { label: "Dimensions", value: product.productDimensions || product.itemDimensionsLxWxH },
                      { label: "Weight", value: product.itemWeight },
                      { label: "Net Quantity", value: product.netQuantity },
                    ].filter(spec => spec.value).map((spec, idx) => (
                      <div key={idx} className="flex justify-between py-3 border-b border-gray-200 last:border-0">
                        <span className="text-gray-500">{spec.label}</span>
                        <span className="text-gray-800 font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <HiTag className="text-purple-600" />
                    Additional Info
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Manufacturer", value: product.manufacturer },
                      { label: "Country of Origin", value: product.countryOfOrigin },
                      { label: "Department", value: product.department },
                      { label: "ASIN", value: product.asin },
                      { label: "Packer", value: product.packer },
                    ].filter(spec => spec.value).map((spec, idx) => (
                      <div key={idx} className="flex justify-between py-3 border-b border-gray-200 last:border-0">
                        <span className="text-gray-500">{spec.label}</span>
                        <span className="text-gray-800 font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 2 && (
              <div role="tabpanel" id="tabpanel-2">
                <ReviewList
                  reviews={reviews}
                  reviewStats={reviewStats}
                  isLoggedin={isLoggedin}
                  canReview={canReview}
                  newRating={newRating}
                  setNewRating={setNewRating}
                  reviewTitle={reviewTitle}
                  setReviewTitle={setReviewTitle}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 lg:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">You May Also Like</h2>
            <div className="relative">
              <Swiper
                spaceBetween={20}
                modules={[Navigation]}
                navigation={{
                  nextEl: `.next-related`,
                  prevEl: `.prev-related`,
                }}
                breakpoints={{
                  320: { slidesPerView: 1.5 },
                  480: { slidesPerView: 2.5 },
                  768: { slidesPerView: 3.5 },
                  1280: { slidesPerView: 4.5 },
                }}
                className="pb-10"
              >
                {relatedProducts.map((item) => (
                  <SwiperSlide key={item._id}>
                    <Link to={`/products/${item._id}`}>
                      <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2 group">
                        <div className="aspect-square overflow-hidden bg-white">
                          <img
                            src={item.images?.[0]?.url || item.images?.[0] || "/placeholder.png"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-gray-800 font-medium truncate mb-2">{item.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                            {item.oldprice > item.price && (
                              <span className="text-sm text-gray-400 line-through">₹{item.oldprice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                type="button"
                className="prev-related absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                aria-label="Previous related products"
              >
                <HiChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                className="next-related absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                aria-label="Next related products"
              >
                <HiChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={product}
        onShare={handleShare}
      />
    </div>
  );
}

export default ProductDetail;