import React, { useContext, useEffect, useState } from "react";
import { FaRegHeart, FaHeart, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { ShoppingCart as Cart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/Appcontext";
import { toast } from "react-toastify";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { MdVerified, MdLocalShipping } from "react-icons/md";

const RightComponent = ({ product }) => {
  const navigate = useNavigate();
  const { isLoggedin, fetchWishlist, wishlistItems, fetchCart } = useContext(AppContext);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const inWishlist = wishlistItems?.some((item) => item._id === product._id);
    setIsWishlisted(inWishlist);
  }, [wishlistItems, product._id]);

  // Fetch review stats
  useEffect(() => {
    if (product?._id) {
      axios.get(`${backendUrl}/api/product/reviews/${product._id}`)
        .then((res) => {
          if (res.data.stats) {
            setReviewStats(res.data.stats);
          }
        })
        .catch((err) => console.error("Error fetching review stats", err));
    }
  }, [product._id, backendUrl]);

  const handleToggleWishlist = async () => {
    if (!isLoggedin) {
      toast.warning("Please login to manage your wishlist");
      return;
    }

    try {
      const url = `${backendUrl}/api/auth/wishlist`;
      const method = isWishlisted ? "delete" : "post";
      const data = { productId: product._id };

      setIsWishlisted((prev) => !prev); // Optimistic update

      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
        fetchWishlist();
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      setIsWishlisted((prev) => !prev); // Revert on error
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedin) {
      toast.warning("Please login to add products to cart");
      navigate("/login");
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    setIsAddingToCart(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/Cart`,
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data?.cart) {
        toast.success("Added to cart!");
        if (fetchCart) fetchCart();
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedin) {
      toast.warning("Please login to purchase");
      navigate("/login");
      return;
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    // Add to cart then navigate to checkout
    try {
      await axios.post(
        `${backendUrl}/api/auth/Cart`,
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      navigate("/checkout");
    } catch (error) {
      console.error("Buy now error:", error);
      toast.error("Failed to proceed");
    }
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const savings = product.oldprice - product.price;

  return (
    <div className="bg-white p-4 rounded-lg space-y-4">
      {/* Title */}
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 leading-tight">
        {product.title}
      </h1>

      {/* Brand, Rating, Reviews */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {product.brand && (
          <span className="text-gray-600">
            Brand: <strong className="text-[#7d0492]">{product.brand}</strong>
          </span>
        )}

        {reviewStats && (
          <>
            <span className="w-px h-4 bg-gray-300"></span>
            <div className="flex items-center gap-1">
              {renderStars(reviewStats.avgRating)}
              <span className="font-medium ml-1">{reviewStats.avgRating}</span>
            </div>
            <span
              className="text-[#7d0492] cursor-pointer font-medium hover:underline"
              onClick={() => document.querySelector('[data-tab="reviews"]')?.click()}
            >
              {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'Review' : 'Reviews'}
            </span>
          </>
        )}
      </div>

      {/* Price Info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
          {product.oldprice > product.price && (
            <>
              <span className="line-through text-gray-400 text-lg">₹{product.oldprice?.toLocaleString()}</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-medium">
                {product.discount}% OFF
              </span>
            </>
          )}
        </div>
        {savings > 0 && (
          <p className="text-green-600 text-sm mt-1">
            You save ₹{savings.toLocaleString()}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${product.availability === "In Stock"
            ? "bg-green-100 text-green-700"
            : product.availability === "Low Stock"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}>
          • {product.availability || "In Stock"}
        </span>

        {product.stock > 0 && product.stock <= 10 && (
          <span className="text-orange-600 text-sm font-medium">
            Only {product.stock} left!
          </span>
        )}
      </div>

      {/* Quantity Selector */}
      {product.stock > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium">Quantity:</span>
          <div className="flex items-center border rounded-lg">
            <button
              className="px-3 py-1 text-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="px-4 py-1 border-x font-medium">{quantity}</span>
            <button
              className="px-3 py-1 text-lg hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Delivery Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <MdLocalShipping className="text-blue-600" size={20} />
        <div>
          <span className="font-medium text-gray-800">Free Delivery</span>
          <span className="text-gray-500 ml-1">on orders above ₹500</span>
        </div>
      </div>

      {/* Offers */}
      <div className="border rounded-lg p-3">
        <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
          <LocalOfferIcon className="text-green-600" fontSize="small" />
          Available Offers
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600">•</span>
            <span>10% off up to ₹749 on HDFC Credit Cards</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">•</span>
            <span>5% Cashback on orders above ₹2000</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">•</span>
            <span>Free gift wrapping on all orders</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || product.stock <= 0}
          className="flex-1 flex items-center justify-center gap-2 bg-[#fb541b] py-3 hover:bg-[#e04818] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Cart fontSize="small" />
          {isAddingToCart ? "Adding..." : product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        <button
          onClick={handleToggleWishlist}
          className={`p-3 rounded-lg border-2 transition-all ${isWishlisted
              ? "bg-red-50 border-red-200 text-red-500"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isWishlisted ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
        </button>
      </div>

      {/* Buy Now Button */}
      <button
        onClick={handleBuyNow}
        disabled={product.stock <= 0}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Buy Now
      </button>

      {/* Seller/Trust Info */}
      <div className="border-t pt-4 mt-4 text-sm text-gray-600 space-y-2">
        {product.manufacturer && (
          <p><span className="text-gray-500">Manufacturer:</span> {product.manufacturer}</p>
        )}
        {product.countryOfOrigin && (
          <p><span className="text-gray-500">Country of Origin:</span> {product.countryOfOrigin}</p>
        )}
        <div className="flex items-center gap-2 text-green-600">
          <MdVerified />
          <span>Secure transaction • Easy returns</span>
        </div>
      </div>
    </div>
  );
};

export default RightComponent;