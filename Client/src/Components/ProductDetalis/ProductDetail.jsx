import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { Navigation, Thumbs, Zoom, FreeMode } from "swiper/modules";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineHeart,
  HiHeart,
  HiOutlineShare,
  HiShoppingCart,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlineBadgeCheck,
  HiStar,
  HiOutlineStar,
  HiOutlineThumbUp,
  HiCheck,
  HiSparkles,
  HiTag,
  HiClock,
  HiArrowRight,
  HiX,
  HiMenu,
  HiSearch,
  HiUser,
  HiShoppingBag
} from "react-icons/hi";
import { MdVerified, MdLocalOffer, MdZoomIn, MdSecurity, MdClose } from "react-icons/md";
import { FaStar, FaStarHalfAlt, FaRegStar, FaQuoteLeft, FaFacebookF, FaTwitter, FaWhatsapp, FaLink } from "react-icons/fa";
import { BiMinus, BiPlus, BiLoaderAlt } from "react-icons/bi";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext";

// Skeleton Loader Component
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

// Size Selector Component
const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Size</h3>
    <div className="flex flex-wrap gap-2">
      {sizes.map((size, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(size.trim())}
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

// Quantity Selector Component
const QuantitySelector = ({ quantity, onDecrease, onIncrease, maxStock }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quantity</h3>
    <div className="inline-flex items-center bg-gray-100 rounded-xl shadow-sm">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="p-3 hover:bg-gray-200 rounded-l-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BiMinus className="w-5 h-5" />
      </button>
      <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center bg-white">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={quantity >= maxStock}
        className="p-3 hover:bg-gray-200 rounded-r-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BiPlus className="w-5 h-5" />
      </button>
    </div>
    {maxStock <= 10 && maxStock > 0 && (
      <p className="text-amber-600 text-sm mt-2 animate-pulse">
        Only {maxStock} items left in stock!
      </p>
    )}
  </div>
);

// Trust Badge Component
const TrustBadge = ({ icon, label, delay = 0 }) => (
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

// Review Card Component
const ReviewCard = ({ review }) => (
  <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
    <div className="flex gap-4">
      <Avatar sx={{
        bgcolor: review.isVerifiedPurchase ? '#059669' : '#6366f1',
        width: 48,
        height: 48,
        fontWeight: 'bold'
      }}>
        {review.userName?.charAt(0).toUpperCase()}
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h4 className="font-semibold text-gray-800">{review.userName}</h4>
          {review.isVerifiedPurchase && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
              <MdVerified size={12} /> Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          {review.title && <span className="font-medium text-gray-700">{review.title}</span>}
        </div>
        <p className="text-xs text-gray-400 mb-3">
          {new Date(review.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        {review.comment && (
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        )}
        <div className="flex items-center gap-4 mt-4">
          <button className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition">
            <HiOutlineThumbUp /> Helpful ({review.helpful || 0})
          </button>
        </div>
        {review.sellerResponse && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-400">
            <p className="text-indigo-600 text-xs font-semibold mb-1">Seller Response</p>
            <p className="text-sm text-gray-700">{review.sellerResponse}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Offer Card Component
const OfferCard = ({ offer, index }) => (
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

function ProductDetail() {
  const { id: productId } = useParams();
  const { userData, isLoggedin, fetchWishlist, wishlistItems, fetchCart } = useContext(AppContext);

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
  const [imageLoading, setImageLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Check wishlist status
  useEffect(() => {
    if (product?._id) {
      const inWishlist = wishlistItems?.some((item) => item._id === product._id);
      setIsWishlisted(inWishlist);
    }
  }, [wishlistItems, product]);

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  // Fetch all data
  useEffect(() => {
    if (!productId) return;

    setLoading(true);

    Promise.all([
      axios.get(`${backendUrl}/api/products/${productId}`),
      axios.get(`${backendUrl}/api/product/reviews/${productId}`),
      axios.get(`${backendUrl}/api/product/related/${productId}`)
    ]).then(([productRes, reviewsRes, relatedRes]) => {
      setProduct(productRes.data);
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.reviews || []);
        setReviewStats(reviewsRes.data.stats);
      } else {
        setReviews(reviewsRes.data || []);
      }
      setRelatedProducts(relatedRes.data.data || []);
      setLoading(false);
    }).catch((err) => {
      console.error("Error fetching data", err);
      setLoading(false);
    });

  }, [productId, backendUrl]);

  // Check if user can review
  useEffect(() => {
    if (productId) {
      const userId = userData?._id;
      axios.get(`${backendUrl}/api/product/can-review`, {
        params: { productId, userId }
      })
        .then((res) => setCanReview(res.data))
        .catch((err) => console.error("Error checking review eligibility", err));
    }
  }, [productId, userData, backendUrl]);

  const fetchReviews = () => {
    axios.get(`${backendUrl}/api/product/reviews/${productId}`)
      .then((res) => {
        if (res.data.success) {
          setReviews(res.data.reviews || []);
          setReviewStats(res.data.stats);
        }
      })
      .catch((err) => console.error("Error loading reviews:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newRating) {
      toast.error("Please select a rating");
      return;
    }

    if (!isLoggedin) {
      toast.warning("Please login to submit a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(`${backendUrl}/api/product/review`, {
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
      return;
    }

    try {
      const method = isWishlisted ? "delete" : "post";
      setIsWishlisted(!isWishlisted);

      await axios({
        method,
        url: `${backendUrl}/api/auth/wishlist`,
        data: { productId: product._id },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
      fetchWishlist();
    } catch (error) {
      setIsWishlisted(!isWishlisted);
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedin) {
      toast.warning("Please login to add to cart");
      return;
    }

    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setIsAddingToCart(true);

    try {
      await axios.post(
        `${backendUrl}/api/auth/Cart`,
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Added to cart!");
      if (fetchCart) fetchCart();
    } catch (error) {
      toast.error("Failed to add to cart");
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<FaStar key={i} className="text-amber-400" />);
      else if (i === fullStars && hasHalf) stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
      else stars.push(<FaRegStar key={i} className="text-amber-400" />);
    }
    return stars;
  };

  const RatingBar = ({ rating, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-3 text-sm group cursor-pointer">
        <span className="w-8 text-gray-600 font-medium">{rating}</span>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <HiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`} />
          ))}
        </div>
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-600"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-12 text-gray-500 text-xs text-right">{count}</span>
      </div>
    );
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
  const savings = product.oldprice - product.price;
  const offers = [
    "10% off up to ₹749 on HDFC Credit Cards",
    "5% Cashback on orders above ₹2000",
    "Free Gift Wrapping on all orders",
    "Extra 5% off on prepaid orders"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="p-2">
            <HiChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-sm font-medium truncate flex-1 px-3">{product.title}</h1>
          <button className="p-2">
            <HiShoppingBag className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto">
            <Link to="/" className="hover:text-indigo-600 transition whitespace-nowrap">Home</Link>
            <span className="whitespace-nowrap">/</span>
            <Link to="/products" className="hover:text-indigo-600 transition whitespace-nowrap">Products</Link>
            <span className="whitespace-nowrap">/</span>
            <span className="text-gray-800 font-medium truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left - Image Gallery */}
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
                            onLoad={() => setImageLoading(false)}
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
                      onClick={handleToggleWishlist}
                      className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${isWishlisted
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 backdrop-blur text-gray-600 hover:bg-white'
                        }`}
                    >
                      {isWishlisted ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
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
                        <div className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === index
                          ? "border-indigo-500 shadow-lg shadow-indigo-200 scale-105"
                          : "border-transparent hover:border-gray-300"
                          }`}>
                          <img src={img.url || img} alt="" className="w-full h-full object-cover" />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>

            {/* Right - Product Info */}
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

              {/* Rating */}
              {reviewStats && (
                <div className="flex items-center gap-3 mb-6">
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
                </div>
              )}

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
                  onClick={handleAddToCart}
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
                  onClick={handleToggleWishlist}
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
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {["Description", "Specifications", "Reviews"].map((tab, idx) => (
              <button
                key={tab}
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
              <div className="prose max-w-none">
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
              <div className="grid md:grid-cols-2 gap-6">
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
              <div>
                {/* Stats */}
                {reviewStats && (
                  <div className="flex flex-col lg:flex-row gap-8 mb-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                    <div className="text-center lg:text-left lg:pr-8 lg:border-r border-indigo-200">
                      <div className="text-5xl font-bold text-gray-900 mb-2">{reviewStats.avgRating}</div>
                      <div className="flex justify-center lg:justify-start gap-1 mb-2">
                        {renderStars(reviewStats.avgRating)}
                      </div>
                      <p className="text-gray-500">Based on {reviewStats.totalReviews} reviews</p>
                      {reviewStats.verifiedPurchases > 0 && (
                        <p className="text-green-600 text-sm mt-2 flex items-center justify-center lg:justify-start gap-1">
                          <MdVerified /> {reviewStats.verifiedPurchases} Verified Purchases
                        </p>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      {[5, 4, 3, 2, 1].map((r) => (
                        <RatingBar
                          key={r}
                          rating={r}
                          count={reviewStats.ratingBreakdown?.[r] || 0}
                          total={reviewStats.totalReviews}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Review List */}
                <div className="space-y-6 mb-10">
                  {reviews.length > 0 ? reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  )) : (
                    <div className="text-center py-12">
                      <FaQuoteLeft className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No reviews yet</p>
                      <p className="text-gray-400">Be the first to review this product!</p>
                    </div>
                  )}
                </div>

                {/* Write Review */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <HiStar className="text-amber-500" />
                    Write a Review
                  </h3>

                  {!isLoggedin ? (
                    <div className="text-center py-8">
                      <HiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Please login to write a review</p>
                      <Link to="/Login" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition">
                        Login to Review
                      </Link>
                    </div>
                  ) : !canReview.canReview ? (
                    <div className="text-center py-8">
                      <MdVerified className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-600">{canReview.reason}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {canReview.isVerifiedPurchase && (
                        <div className="flex items-center gap-2 p-4 bg-green-100 text-green-700 rounded-xl">
                          <MdVerified className="w-5 h-5" />
                          <span className="font-medium">Your review will be marked as Verified Purchase!</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
                        <Rating
                          size="large"
                          value={newRating}
                          onChange={(e, value) => setNewRating(value)}
                          sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }}
                        />
                      </div>

                      <TextField
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        label="Review Title"
                        placeholder="Summarize your experience"
                        fullWidth
                        variant="outlined"
                      />

                      <TextField
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        label="Your Review"
                        placeholder="What did you like or dislike?"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                      />

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  )}
                </div>
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

              <button className="prev-related absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all">
                <HiChevronLeft className="w-6 h-6" />
              </button>
              <button className="next-related absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all">
                <HiChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Share Product</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => handleShare('facebook')}
                className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                <FaFacebookF className="w-6 h-6 mx-auto" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition"
              >
                <FaTwitter className="w-6 h-6 mx-auto" />
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                <FaWhatsapp className="w-6 h-6 mx-auto" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="p-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
              >
                <FaLink className="w-6 h-6 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;