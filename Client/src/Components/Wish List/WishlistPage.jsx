import React, { useContext, useEffect } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { FiHeart, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import SideMenu from "../My Profile/SideMenu.jsx";
import { AppContext } from "../context/Appcontext.jsx";

function WishlistPage() {
  const { wishlistItems, setWishlistItems, fetchWishlist } = useContext(AppContext);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/api/auth/delete-wishlist/${productId}`);
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
    <section className="py-6 md:py-12 bg-[#fcfcf9]  min-h-screen font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">

          {/* Sidebar */}
          <div className="lg:w-1/4 w-full order-2 lg:order-1">
            <SideMenu />
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 w-full order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

              {/* Header: Heritage Style */}
              <div className="p-6 md:p-10 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1a3a32] tracking-tight">
                    My Curated Collection
                  </h1>
                  <p className="text-stone-500 text-sm mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                    You have <span className="text-[#1a3a32] font-bold">{wishlistItems.length} treasures</span> saved
                  </p>
                </div>
                <div className="hidden sm:flex p-4 bg-[#fdfbf7] border border-[#c5a059]/20 rounded-2xl">
                  <FiHeart className="text-[#c5a059] text-2xl" />
                </div>
              </div>

              <div className="p-4 md:p-8">
                {wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[850px] pr-2 custom-scrollbar">
                    {wishlistItems.map((item) => {
                      const product = item.product || item;
                      if (!product || !product._id) return null;

                      return (
                        <div
                          key={product._id}
                          className="group relative bg-white border border-stone-100 rounded-2xl p-4 flex flex-row items-center gap-5 hover:border-[#c5a059]/30 hover:shadow-lg hover:shadow-[#1a3a32]/5 transition-all duration-500"
                        >
                          {/* Close Button - Heritage Style */}
                          <button
                            onClick={() => handleRemove(product._id)}
                            className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow-md border border-stone-100 text-stone-400 hover:text-red-700 hover:scale-110 transition-all z-10"
                            aria-label="Remove item"
                          >
                            <IoCloseSharp size={18} />
                          </button>

                          {/* Product Image */}
                          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-[#fdfbf7] flex-shrink-0 relative border border-stone-50">
                            <Link to={`/products/${product._id}`}>
                              <img
                                src={product.image || "https://via.placeholder.com/150"}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </Link>
                          </div>

                          {/* Product Info */}
                          <div className="flex-grow min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">
                              {product.brand || "Authentic Craft"}
                            </span>

                            <h3 className="text-sm sm:text-base font-serif font-bold text-[#1a3a32] mt-1 mb-2 line-clamp-2 group-hover:text-[#c5a059] transition-colors">
                              <Link to={`/products/${product._id}`}>
                                {product.title}
                              </Link>
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="text-lg font-bold text-[#1a3a32]">
                                ₹{product.price?.toLocaleString()}
                              </span>
                              {product.oldprice && (
                                <span className="text-xs text-stone-400 line-through">
                                  ₹{product.oldprice.toLocaleString()}
                                </span>
                              )}
                              {product.discount && (
                                <span className="text-[10px] font-bold text-[#1a3a32] bg-[#c5a059]/10 px-2 py-0.5 rounded-md border border-[#c5a059]/20">
                                  {product.discount}% OFF
                                </span>
                              )}
                            </div>

                            {/* View Button */}
                            <Link
                              to={`/products/${product._id}`}
                              className="inline-flex items-center gap-2 text-xs font-bold text-[#1a3a32] border-b border-[#1a3a32]/20 pb-0.5 hover:border-[#c5a059] hover:text-[#c5a059] transition-all group/btn"
                            >
                              Explore Product
                              <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Heritage Empty State */
                  <div className="py-10 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-[#c5a059]/10 rounded-full animate-pulse" />
                      <div className="relative w-full h-full bg-[#fdfbf7] rounded-full flex items-center justify-center border border-[#c5a059]/20">
                        <FiHeart className="text-[#c5a059] text-4xl opacity-40" />
                      </div>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#1a3a32]">Your collection is empty</h3>
                    <p className="text-stone-500 mt-2 max-w-xs mx-auto italic">
                      Discover handcrafted treasures from the North East and save your favorites here.
                    </p>
                    <Link to="/" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 bg-[#1a3a32] text-white font-bold rounded-xl hover:bg-[#c5a059] shadow-lg shadow-[#1a3a32]/10 transition-all">
                      Start Exploring
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