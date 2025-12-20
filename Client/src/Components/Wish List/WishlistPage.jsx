import React, { useContext, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { FiHeart, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import SideMenu from "../My Profile/SideMenu.jsx";
import { AppContext } from "../context/Appcontext.jsx";

function WishlistPage() {
  const { wishlistItems, setWishlistItems, fetchWishlist } = useContext(AppContext);
  const token = localStorage.getItem("token");

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/delete-wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems((prev) =>
        prev.filter((item) => (item?.product?._id || item?._id) !== productId)
      );
    } catch (err) {
      console.error("Error removing wishlist item:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <section className="py-6 md:py-12 bg-[#f9fafb] min-h-screen font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          
          {/* Sidebar - Stays at top on mobile, side on desktop */}
          <div className="lg:w-1/4 w-full order-2 lg:order-1">
            <SideMenu />
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 w-full order-1 lg:order-2">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Header: More vertical padding on mobile */}
              <div className="p-6 md:p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">My Wishlist</h1>
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    You have <span className="text-purple-600 font-bold">{wishlistItems.length} items</span> saved
                  </p>
                </div>
                <div className="hidden sm:flex p-4 bg-pink-50 rounded-2xl">
                  <FiHeart className="text-pink-500 text-2xl" />
                </div>
              </div>

              <div className="p-4 md:p-8">
                {wishlistItems.length > 0 ? (
                  /* RESPONSIVE GRID: 1 col on mobile, 2 on lg screens */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                    {wishlistItems.map((item) => {
                      const product = item.product || item;
                      if (!product || !product._id) return null;

                      return (
                        <div 
                          key={product._id} 
                          className="group relative bg-white border border-gray-100 rounded-3xl p-4 flex flex-row items-center gap-5 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500"
                        >
                          {/* Close Button - Larger touch target for mobile */}
                          <button
                            onClick={() => handleRemove(product._id)}
                            className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-lg border border-gray-100 text-gray-400 hover:text-red-500 hover:scale-110 transition-all z-10"
                            aria-label="Remove item"
                          >
                            <IoCloseSharp size={18} />
                          </button>

                          {/* Product Image Wrapper */}
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                            <Link to={`/products/${product._id}`}>
                              <img
                                src={product.image || "https://via.placeholder.com/150"}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            </Link>
                          </div>

                          {/* Product Info */}
                          <div className="flex-grow min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-400">
                              {product.brand || "Exclusive"}
                            </span>
                            
                            <h3 className="text-sm sm:text-base font-bold text-gray-800 mt-1 mb-2 line-clamp-1 group-hover:text-purple-700 transition-colors">
                              <Link to={`/products/${product._id}`}>
                                {product.title}
                              </Link>
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="text-lg font-black text-gray-900">
                                ₹{product.price?.toLocaleString()}
                              </span>
                              {product.oldprice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{product.oldprice.toLocaleString()}
                                </span>
                              )}
                              {product.discount && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                  {product.discount}% OFF
                                </span>
                              )}
                            </div>

                            {/* View Button - Simple & Modern */}
                            <Link 
                                to={`/products/${product._id}`}
                                className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 group/btn hover:translate-x-1 transition-transform"
                            >
                                Shop Now
                                <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Modern Empty State */
                  <div className="py-24 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                       <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-25" />
                       <div className="relative w-full h-full bg-purple-50 rounded-full flex items-center justify-center">
                          <FiHeart className="text-purple-300 text-4xl" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Your wishlist is lonely</h3>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">Add items you love to find them later and keep track of price drops.</p>
                    <Link to="/" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 transition-all">
                        Discover Products
                        <FiShoppingCart size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default WishlistPage;