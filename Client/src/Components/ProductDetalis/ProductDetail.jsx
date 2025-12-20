import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { Navigation, Thumbs, Zoom } from "swiper/modules";
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
  HiCheck
} from "react-icons/hi";
import { MdVerified, MdLocalOffer, MdZoomIn } from "react-icons/md";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { BiMinus, BiPlus } from "react-icons/bi";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext";

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
      <div className="flex items-center gap-2 text-sm group cursor-pointer">
        <span className="w-3 text-gray-600">{rating}</span>
        <HiStar className="text-amber-400 text-sm" />
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-600"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-gray-500 text-xs text-right">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <HiShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-medium hover:bg-purple-700 transition-all transform hover:scale-105">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: "/placeholder.png" }];
  const savings = product.oldprice - product.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-purple-600 transition">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-purple-600 transition">Products</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* Left - Image Gallery */}
            <div className="p-6 lg:p-10 bg-gradient-to-br from-gray-50 to-white">
              <div className="sticky top-24">
                {/* Main Image */}
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg mb-4 group">
                  <Swiper
                    spaceBetween={0}
                    navigation={images.length > 1}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    modules={[Navigation, Thumbs, Zoom]}
                    zoom={{ maxRatio: 2 }}
                    onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                    className="aspect-square"
                  >
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className="swiper-zoom-container h-full flex items-center justify-center bg-white p-8">
                          <img
                            src={img.url || img}
                            alt={img.altText || product.title}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.discount > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{product.discount}%
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        Featured
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
                    <button className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 hover:bg-white transition-all transform hover:scale-110">
                      <HiOutlineShare className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Zoom hint */}
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MdZoomIn /> Hover to zoom
                  </div>

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={12}
                    slidesPerView={5}
                    watchSlidesProgress={true}
                    modules={[Navigation, Thumbs]}
                  >
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === index
                          ? "border-purple-500 shadow-lg shadow-purple-200"
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
            <div className="p-6 lg:p-10 flex flex-col">
              {/* Brand */}
              {product.brand && (
                <span className="inline-flex items-center gap-1.5 text-purple-600 font-medium text-sm mb-2">
                  <HiOutlineBadgeCheck className="w-4 h-4" />
                  {product.brand}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {product.title}
              </h1>

              {/* Rating */}
              {reviewStats && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1 rounded-lg">
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
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 mb-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.oldprice > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.oldprice?.toLocaleString()}
                      </span>
                      <span className="bg-green-500 text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-green-600 font-medium">
                    You save ₹{savings.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
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
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-orange-600 text-sm font-medium animate-pulse">
                    Only {product.stock} left!
                  </span>
                )}
              </div>

              {/* Size Selection */}
              {product.size && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.split(',').map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(size.trim())}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedSize === size.trim()
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {size.trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Quantity</h3>
                  <div className="inline-flex items-center bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-200 rounded-l-xl transition disabled:opacity-50"
                    >
                      <BiMinus className="w-5 h-5" />
                    </button>
                    <span className="px-6 py-3 font-semibold text-lg min-w-[60px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      className="p-3 hover:bg-gray-200 rounded-r-xl transition disabled:opacity-50"
                    >
                      <BiPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <HiShoppingCart className="w-6 h-6" />
                  {isAddingToCart ? "Adding..." : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>

                {/* Wishlist Button - Prominent */}
                <button
                  onClick={handleToggleWishlist}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] ${isWishlisted
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
                    }`}
                >
                  {isWishlisted ? <HiHeart className="w-6 h-6" /> : <HiOutlineHeart className="w-6 h-6" />}
                  <span className="hidden sm:inline">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
              </div>

              {/* Offers */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6">
                <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                  <MdLocalOffer className="text-green-600" />
                  Available Offers
                </h3>
                <ul className="space-y-3">
                  {[
                    "10% off up to ₹749 on HDFC Credit Cards",
                    "5% Cashback on orders above ₹2000",
                    "Free Gift Wrapping on all orders"
                  ].map((offer, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <HiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{offer}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <HiOutlineTruck className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Free Delivery</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <HiOutlineRefresh className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Easy Returns</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <HiOutlineShieldCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Secure Payment</p>
                </div>
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
        <div className="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {["Description", "Specifications", "Reviews"].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 py-5 px-6 font-semibold text-center transition-all relative ${activeTab === idx
                  ? "text-purple-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {tab}
                {tab === "Reviews" && reviewStats && (
                  <span className="ml-1 text-sm text-gray-400">({reviewStats.totalReviews})</span>
                )}
                {activeTab === idx && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-10">
            {/* Description */}
            {activeTab === 0 && (
              <div className="prose max-w-none">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">About this product</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {product.aboutThisItem && (
                  <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">Key Features</h4>
                    <p className="text-gray-700 whitespace-pre-line">{product.aboutThisItem}</p>
                  </div>
                )}

                {product.careInstructions && (
                  <div className="bg-amber-50 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 mb-3">Care Instructions</h4>
                    <p className="text-gray-600">{product.careInstructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Specifications */}
            {activeTab === 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Product Details</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Brand", value: product.brand },
                      { label: "Size", value: product.size },
                      { label: "Material", value: product.materialComposition },
                      { label: "Dimensions", value: product.productDimensions || product.itemDimensionsLxWxH },
                      { label: "Weight", value: product.itemWeight },
                      { label: "Net Quantity", value: product.netQuantity },
                    ].filter(spec => spec.value).map((spec, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="text-gray-500">{spec.label}</span>
                        <span className="text-gray-800 font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Additional Info</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Manufacturer", value: product.manufacturer },
                      { label: "Country of Origin", value: product.countryOfOrigin },
                      { label: "Department", value: product.department },
                      { label: "ASIN", value: product.asin },
                      { label: "Packer", value: product.packer },
                    ].filter(spec => spec.value).map((spec, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
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
                  <div className="flex flex-col lg:flex-row gap-8 mb-10 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <div className="text-center lg:text-left lg:pr-8 lg:border-r border-purple-200">
                      <div className="text-5xl font-bold text-gray-900 mb-2">{reviewStats.avgRating}</div>
                      <div className="flex justify-center lg:justify-start gap-1 mb-2">
                        {renderStars(reviewStats.avgRating)}
                      </div>
                      <p className="text-gray-500">Based on {reviewStats.totalReviews} reviews</p>
                      {reviewStats.verifiedPurchases > 0 && (
                        <p className="text-green-600 text-sm mt-1 flex items-center justify-center lg:justify-start gap-1">
                          <MdVerified /> {reviewStats.verifiedPurchases} Verified Purchases
                        </p>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
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
                    <div key={review._id} className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                      <div className="flex gap-4">
                        <Avatar sx={{
                          bgcolor: review.isVerifiedPurchase ? '#059669' : '#7c3aed',
                          width: 48,
                          height: 48
                        }}>
                          {review.userName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                            {review.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                <MdVerified size={12} /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            {review.title && <span className="font-medium text-gray-700">{review.title}</span>}
                          </div>
                          <p className="text-xs text-gray-400 mb-3">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                          {review.comment && <p className="text-gray-700">{review.comment}</p>}

                          <button className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                            <HiOutlineThumbUp /> Helpful ({review.helpful || 0})
                          </button>

                          {review.sellerResponse && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                              <p className="text-blue-600 text-xs font-semibold mb-1">Seller Response</p>
                              <p className="text-sm text-gray-700">{review.sellerResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <HiOutlineStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No reviews yet</p>
                      <p className="text-gray-400">Be the first to review this product!</p>
                    </div>
                  )}
                </div>

                {/* Write Review */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Write a Review</h3>

                  {!isLoggedin ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Please login to write a review</p>
                      <Link to="/Login" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition">
                        Login to Review
                      </Link>
                    </div>
                  ) : !canReview.canReview ? (
                    <div className="text-center py-8">
                      <MdVerified className="w-12 h-12 text-green-500 mx-auto mb-3" />
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
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50"
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
          <div className="mt-8 bg-white rounded-3xl shadow-xl p-6 lg:p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">You May Also Like</h2>
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
            >
              {relatedProducts.map((item) => (
                <SwiperSlide key={item._id}>
                  <Link to={`/products/${item._id}`}>
                    <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 group">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.images?.[0]?.url || item.images?.[0] || "/placeholder.png"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-gray-800 font-medium truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
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

            <button className="prev-related absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition">
              <HiChevronLeft className="w-6 h-6" />
            </button>
            <button className="next-related absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition">
              <HiChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
