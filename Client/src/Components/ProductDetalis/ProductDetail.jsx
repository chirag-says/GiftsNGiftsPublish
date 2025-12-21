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

  useEffect(() => {
    if (product?._id) {
      const inWishlist = wishlistItems?.some((item) => item._id === product._id);
      setIsWishlisted(inWishlist);
    }
  }, [wishlistItems, product]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

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
    if (!newRating) { toast.error("Please select a rating"); return; }
    if (!isLoggedin) { toast.warning("Please login to submit a review"); return; }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${backendUrl}/api/product/review`, {
        productId, userId: userData?._id, userName: userData?.name || "Anonymous",
        rating: newRating, comment: newComment, title: reviewTitle
      });
      if (res.data.success) {
        toast.success(res.data.message || "Review submitted!");
        setNewComment(""); setNewRating(5); setReviewTitle(""); fetchReviews();
        setCanReview({ canReview: false, reason: "You have already reviewed this product" });
      } else { toast.error(res.data.error || "Failed to submit review"); }
    } catch (err) { toast.error(err.response?.data?.error || "Error submitting review"); }
    finally { setIsSubmitting(false); }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedin) { toast.warning("Please login to manage wishlist"); return; }
    try {
      const method = isWishlisted ? "delete" : "post";
      setIsWishlisted(!isWishlisted);
      await axios({
        method, url: `${backendUrl}/api/auth/wishlist`,
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
    if (!isLoggedin) { toast.warning("Please login to add to cart"); return; }
    if (product.stock <= 0) { toast.error("Product is out of stock"); return; }
    setIsAddingToCart(true);
    try {
      await axios.post(`${backendUrl}/api/auth/Cart`, { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Added to cart!");
      if (fetchCart) fetchCart();
    } catch (error) { toast.error("Failed to add to cart"); }
    finally { setIsAddingToCart(false); }
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
      <div className="flex items-center gap-4 text-sm group cursor-pointer">
        <span className="w-4 font-bold text-gray-700">{rating}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-10 text-gray-400 text-xs text-right font-medium">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
            <HiShoppingCart className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Item missing</h2>
          <p className="text-gray-500 mb-8">The product you're looking for may have been moved or removed.</p>
          <Link to="/" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: "/placeholder.png" }];
  const savings = product.oldprice - product.price;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold text-gray-400">
            <Link to="/" className="hover:text-purple-600 transition">Home</Link>
            <span>/</span>
            <span className="text-gray-800">{product.brand || 'Collection'}</span>
            <span>/</span>
            <span className="text-purple-600 truncate max-w-[150px]">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* Left - Image Gallery */}
            <div className="p-4 lg:p-10 border-r border-gray-50">
              <div className="sticky top-28">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 group">
                  <Swiper
                    spaceBetween={0}
                    navigation={images.length > 1}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    modules={[Navigation, Thumbs, Zoom]}
                    zoom={{ maxRatio: 2 }}
                    onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                    className="h-full w-full"
                  >
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div className="swiper-zoom-container h-full flex items-center justify-center p-6 sm:p-12">
                          <img
                            src={img.url || img}
                            alt={product.title}
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Top Badges */}
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                    {product.discount > 0 && (
                      <span className="bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-black shadow-xl">
                        -{product.discount}%
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="bg-amber-400 text-amber-900 px-3 py-1 rounded-lg text-xs font-black shadow-xl uppercase">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
                    <button
                      onClick={handleToggleWishlist}
                      className={`p-3 rounded-2xl shadow-xl transition-all hover:scale-110 ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white text-gray-400'}`}
                    >
                      {isWishlisted ? <HiHeart size={22} /> : <HiOutlineHeart size={22} />}
                    </button>
                    <button className="p-3 bg-white text-gray-400 rounded-2xl shadow-xl hover:text-purple-600 transition-all hover:scale-110">
                      <HiOutlineShare size={22} />
                    </button>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/50 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <MdZoomIn className="text-base" /> PINCH TO ZOOM
                  </div>
                </div>

                {/* Thumbnails Swiper */}
                {images.length > 1 && (
                  <div className="mt-6 px-2">
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={15}
                      slidesPerView={5}
                      watchSlidesProgress={true}
                      modules={[Navigation, Thumbs]}
                      className="thumbs-slider"
                    >
                      {images.map((img, index) => (
                        <SwiperSlide key={index}>
                          <div className={`aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === index ? "border-purple-500 shadow-lg shadow-purple-100" : "border-gray-100 opacity-60"}`}>
                            <img src={img.url || img} className="w-full h-full object-cover" alt="" />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Product Info */}
            <div className="p-6 lg:p-12 flex flex-col">
              <div className="mb-4 flex items-center gap-2">
                <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 flex items-center gap-1.5">
                  <HiOutlineBadgeCheck className="text-sm" /> {product.brand || 'Original'}
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
                {product.title}
              </h1>

              {/* Rating Summary */}
              {reviewStats && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-100 font-black text-sm">
                    {reviewStats.avgRating} <HiStar className="mb-0.5" />
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {reviewStats.totalReviews} Reviews
                  </span>
                </div>
              )}

              {/* Pricing Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8 relative overflow-hidden">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.oldprice > product.price && (
                    <span className="text-xl text-gray-300 line-through font-bold">
                      ₹{product.oldprice?.toLocaleString()}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-emerald-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-1">
                    <MdLocalOffer /> You save ₹{savings.toLocaleString()} Today
                  </p>
                )}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <HiShoppingCart size={100} />
                </div>
              </div>

              {/* Inventory Management */}
              <div className="space-y-8 mb-10">
                {product.size && (
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Variation</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.size.split(',').map((size, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSize(size.trim())}
                          className={`min-w-[50px] px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${selectedSize === size.trim() ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200' : 'bg-white border-gray-100 text-gray-500 hover:border-purple-200'}`}
                        >
                          {size.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-fit">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quantity</h3>
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="p-3 bg-white rounded-xl shadow-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"><BiMinus /></button>
                      <span className="px-8 font-black text-lg text-gray-800 min-w-[60px] text-center tabular-nums">{quantity}</span>
                      <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock} className="p-3 bg-white rounded-xl shadow-sm text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"><BiPlus /></button>
                    </div>
                  </div>
                  
                  <div className="pt-8">
                     <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${product.availability === "In Stock" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${product.availability === "In Stock" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                        {product.availability}
                     </div>
                  </div>
                </div>
              </div>

              {/* Purchase Actions */}
              <div className="grid sm:grid-cols-4 gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock <= 0}
                  className="sm:col-span-3 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-purple-200 hover:translate-y-[-2px] transition-all disabled:opacity-50 active:scale-95"
                >
                  <HiShoppingCart className="text-xl" />
                  {isAddingToCart ? "Securing..." : product.stock <= 0 ? "Unavailable" : "Add to Bag"}
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`flex items-center justify-center py-5 rounded-2xl border-2 transition-all ${isWishlisted ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-200' : 'bg-white border-gray-100 text-gray-300 hover:text-rose-500 hover:border-rose-100'}`}
                >
                  {isWishlisted ? <HiHeart size={28} /> : <HiOutlineHeart size={28} />}
                </button>
              </div>

              {/* Trust Section */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-50">
                <div className="text-center group">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gray-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all"><HiOutlineTruck /></div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Express Ship</p>
                </div>
                <div className="text-center group">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gray-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all"><HiOutlineRefresh /></div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">7 Day Return</p>
                </div>
                <div className="text-center group">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gray-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all"><HiOutlineShieldCheck /></div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secure Pay</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div className="mt-12 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex bg-gray-50/50 p-2 overflow-x-auto no-scrollbar">
            {["Description", "Specifications", "Reviews"].map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 min-w-[120px] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === idx ? "bg-white text-purple-600 shadow-lg shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"}`}
              >
                {tab} {tab === "Reviews" && reviewStats && <span className="opacity-40 ml-1">({reviewStats.totalReviews})</span>}
              </button>
            ))}
          </div>

          <div className="p-8 lg:p-12">
            {/* Content Logic Stays Same */}
            {activeTab === 0 && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="p-8 bg-purple-50/50 rounded-3xl border border-purple-100/50">
                   <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2"><span className="w-8 h-1 bg-purple-600 rounded-full"></span> Product Story</h3>
                   <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-medium">{product.description}</p>
                </div>
                {product.aboutThisItem && (
                   <div className="grid md:grid-cols-2 gap-4">
                      {product.aboutThisItem.split('\n').map((item, i) => item.trim() && (
                        <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-2xl items-start">
                           <HiCheck className="text-emerald-500 mt-1 flex-shrink-0" />
                           <span className="text-sm font-bold text-gray-600">{item}</span>
                        </div>
                      ))}
                   </div>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Core Dimensions</h3>
                  {[
                    { label: "Weight", value: product.itemWeight },
                    { label: "Dimensions", value: product.productDimensions || product.itemDimensionsLxWxH },
                    { label: "Material", value: product.materialComposition },
                    { label: "Net Quantity", value: product.netQuantity },
                  ].filter(s => s.value).map((spec, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-gray-50 group hover:border-purple-200 transition-all">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{spec.label}</span>
                      <span className="text-sm font-black text-gray-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Global Info</h3>
                  {[
                    { label: "Manufacturer", value: product.manufacturer },
                    { label: "Country", value: product.countryOfOrigin },
                    { label: "Category", value: product.department },
                    { label: "Serial", value: product.asin },
                  ].filter(s => s.value).map((spec, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-gray-50 group hover:border-purple-200 transition-all">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{spec.label}</span>
                      <span className="text-sm font-black text-gray-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="max-w-5xl mx-auto">
                {/* Visual Stats */}
                {reviewStats && (
                  <div className="bg-slate-900 rounded-[3rem] p-10 mb-12 text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl">
                    <div className="text-center md:text-left">
                      <h4 className="text-6xl font-black mb-3 tracking-tighter">{reviewStats.avgRating}</h4>
                      <div className="flex justify-center md:justify-start gap-1 mb-4">
                        {renderStars(reviewStats.avgRating)}
                      </div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Based on {reviewStats.totalReviews} global reviews</p>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      {[5, 4, 3, 2, 1].map((r) => (
                        <RatingBar key={r} rating={r} count={reviewStats.ratingBreakdown?.[r] || 0} total={reviewStats.totalReviews} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6 mb-16">
                  {reviews.length > 0 ? reviews.map((review) => (
                    <div key={review._id} className="p-8 bg-gray-50 rounded-[2rem] hover:bg-white border border-transparent hover:border-gray-100 transition-all duration-300">
                      <div className="flex gap-6">
                        <Avatar sx={{ bgcolor: review.isVerifiedPurchase ? '#10b981' : '#000', width: 56, height: 56, fontBlack: '900' }}>
                          {review.userName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                            <div>
                               <h5 className="font-black text-gray-800 text-lg">{review.userName}</h5>
                               <div className="flex mt-1">{renderStars(review.rating)}</div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-2 sm:pt-0">{new Date(review.createdAt).toDateString()}</span>
                          </div>
                          {review.isVerifiedPurchase && (
                             <div className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-tighter mb-4 bg-emerald-50 px-2 py-0.5 rounded-full"><MdVerified/> Verified Purchase</div>
                          )}
                          <h6 className="font-bold text-gray-800 mb-2 italic">"{review.title}"</h6>
                          <p className="text-gray-500 text-sm leading-relaxed">{review.comment}</p>
                          <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-purple-600 transition"><HiOutlineThumbUp size={16}/> Helpful ({review.helpful || 0})</button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                       <HiOutlineStar className="mx-auto text-6xl text-gray-200 mb-4" />
                       <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No feedback yet</p>
                    </div>
                  )}
                </div>

                {/* Form Styling */}
                <div className="bg-white border border-purple-100 rounded-[3rem] p-10 shadow-xl shadow-purple-50/50">
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Write a Review</h3>
                  <p className="text-gray-400 text-sm mb-10">Help others choose the perfect gift by sharing your experience.</p>

                  {!isLoggedin ? (
                    <div className="py-10 text-center bg-gray-50 rounded-2xl">
                      <Link to="/Login" className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all">Identify to Review</Link>
                    </div>
                  ) : !canReview.canReview ? (
                    <div className="p-8 bg-emerald-50 text-emerald-700 rounded-3xl flex items-center gap-4 border border-emerald-100 font-bold">
                      <MdVerified size={32}/> {canReview.reason}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="grid gap-8">
                      <div>
                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-4">Quality Score</label>
                        <Rating size="large" value={newRating} onChange={(e, v) => setNewRating(v)} sx={{ '& .MuiRating-iconFilled': { color: '#a855f7' } }} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                         <TextField fullWidth variant="filled" label="Title" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} InputProps={{ disableUnderline: true, className: '!rounded-2xl overflow-hidden' }} />
                         <div className="hidden md:block"></div>
                      </div>
                      <TextField fullWidth multiline rows={4} variant="filled" label="Your authentic feedback..." value={newComment} onChange={(e) => setNewComment(e.target.value)} InputProps={{ disableUnderline: true, className: '!rounded-2xl overflow-hidden' }} />
                      <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white w-fit px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all disabled:opacity-50">
                        {isSubmitting ? "Processing..." : "Publish Experience"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar items section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-end justify-between mb-12 px-2">
              <div>
                 <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic">Recommended</h2>
                 <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Curated matchings for this item</p>
              </div>
              <div className="flex gap-2">
                 <button className="prev-related p-3 bg-white rounded-2xl shadow-md hover:bg-purple-600 hover:text-white transition active:scale-90"><HiChevronLeft size={24}/></button>
                 <button className="next-related p-3 bg-white rounded-2xl shadow-md hover:bg-purple-600 hover:text-white transition active:scale-90"><HiChevronRight size={24}/></button>
              </div>
            </div>

            <Swiper
              spaceBetween={24}
              modules={[Navigation]}
              navigation={{ nextEl: '.next-related', prevEl: '.prev-related' }}
              breakpoints={{
                320: { slidesPerView: 1.3 },
                480: { slidesPerView: 2.3 },
                1024: { slidesPerView: 3.3 },
                1280: { slidesPerView: 4.5 },
              }}
            >
              {relatedProducts.map((item) => (
                <SwiperSlide key={item._id}>
                  <Link to={`/products/${item._id}`} className="group block">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-100 hover:translate-y-[-8px]">
                      <div className="aspect-square bg-gray-50 rounded-[2rem] overflow-hidden mb-6 relative">
                        <img
                          src={item.images?.[0]?.url || item.images?.[0] || "/placeholder.png"}
                          alt={item.title}
                          className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <h3 className="text-gray-800 font-black text-xs truncate mb-2 uppercase tracking-tight group-hover:text-purple-600 transition-colors">{item.title}</h3>
                      <div className="flex items-center justify-between">
                         <span className="text-lg font-black text-gray-900 tracking-tighter">₹{item.price}</span>
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-purple-600 group-hover:text-white transition-all"><HiShoppingCart size={14}/></div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;