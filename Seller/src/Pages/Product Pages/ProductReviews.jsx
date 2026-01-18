import React, { useEffect, useMemo, useState } from "react";
import { FaStar, FaPercentage, FaChartBar, FaRegLightbulb } from "react-icons/fa";
import { FiRefreshCw, FiChevronDown, FiInbox, FiFilter } from "react-icons/fi";
import { useSellerProducts } from "../../hooks/useSellerProducts.js";
import { useProductReviews } from "../../hooks/useProductReviews.js";
import ProductReviewList from "../../Components/Products/ProductReviewList.jsx";

const ratingLabels = {
  5: "Excellent", 4: "Great", 3: "Average", 2: "Fair", 1: "Poor",
};

function ProductReviews() {
  const { products, loading: productsLoading, error: productsError } = useSellerProducts();
  const [activeProductId, setActiveProductId] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    if (!activeProductId && products.length) {
      setActiveProductId(products[0]._id);
    }
  }, [activeProductId, products]);

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    averageRating,
    ratingBreakdown,
    refresh,
  } = useProductReviews(activeProductId);

  const filteredReviews = useMemo(() => {
    if (ratingFilter === "all") return reviews;
    return reviews.filter((r) => Number(r.rating) === Number(ratingFilter));
  }, [reviews, ratingFilter]);

  const totalReviews = reviews.length;
  const positiveRatio = totalReviews
    ? Math.round((reviews.filter((r) => Number(r.rating) >= 4).length / totalReviews) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12 space-y-6 md:space-y-10 animate-fadeIn">
      
      {/* 1. ADAPTIVE PAGE HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Intelligence</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">Review Analytics</h1>
          <p className="text-sm font-medium text-gray-500 max-w-md hidden sm:block">
            Monitor product sentiment and track feedback trends.
          </p>
        </header>

        <button
          onClick={refresh}
          className="flex w-full md:w-fit items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 md:py-3 text-sm font-bold text-gray-700 shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <FiRefreshCw className={reviewsLoading ? "animate-spin" : ""} />
          <span>Sync Feed</span>
        </button>
      </div>

      {/* 2. RESPONSIVE DROPDOWNS BAR */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-center">
        {/* Product Select Wrapper */}
        <div className="lg:col-span-8">
          <div className="relative group cursor-pointer">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-indigo-500 pointer-events-none">
              <FiInbox size={18} />
            </div>
            <select
              value={activeProductId}
              onChange={(e) => setActiveProductId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-[1.25rem] pl-12 pr-10 py-4 text-sm font-bold text-gray-800 shadow-sm appearance-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all outline-none"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <FiChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Rating Filter Wrapper */}
        <div className="lg:col-span-4">
          <div className="relative group cursor-pointer">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-amber-500 pointer-events-none">
              <FiFilter size={16} />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-[1.25rem] pl-12 pr-10 py-4 text-sm font-bold text-gray-800 shadow-sm appearance-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all outline-none"
            >
              <option value="all">All Feedback</option>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>{s} Stars Only</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <FiChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. BENTO STATS GRID */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        
        {/* SCORE CARD */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-orange-500 p-6 md:p-8 text-white shadow-xl shadow-amber-200/50">
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Average Score</p>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">{averageRating.toFixed(1)}</h2>
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.round(averageRating) ? "text-white" : "text-white/30"} size={14} />
                ))}
              </div>
              <span className="text-[11px] font-bold opacity-80">({totalReviews} reviews)</span>
            </div>
          </div>
          <FaStar className="absolute -right-8 -top-8 text-white/10" size={180} />
        </div>

        {/* DISTRIBUTION CARD */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FaChartBar size={14} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Distribution</p>
          </div>
          <div className="space-y-3.5">
            {[5, 4, 3, 2, 1].map((score) => {
              const count = ratingBreakdown?.[score] || 0;
              const percent = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={score} className="flex items-center gap-4">
                  <span className="text-xs font-black text-gray-400 w-2">{score}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-50 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 w-8 text-right">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SATISFACTION CARD */}
        <div className="rounded-[2.5rem] border border-indigo-50 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><FaPercentage size={12} /></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Sentiment</p>
          </div>
          <h2 className="text-5xl font-black text-indigo-900 tracking-tighter">{positiveRatio}%</h2>
          <p className="text-xs font-bold text-indigo-400 mt-1 uppercase">Positive Ratio</p>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50">
              <FaRegLightbulb className="text-amber-500 shrink-0" />
              <p className="text-[11px] font-bold text-indigo-800 leading-tight">
                Status: {ratingLabels[Math.round(averageRating)] || "Healthy"}
              </p>
          </div>
        </div>
      </div>

      {/* 4. REVIEWS STREAM */}
      <section className="rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl shadow-gray-200/40 overflow-hidden transition-all">
        <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Recent Reviews</h3>
            <span className="rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-black text-white shadow-lg shadow-indigo-100">
              {filteredReviews.length} Records
            </span>
        </div>
        
        <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scroll-smooth">
          {productsLoading || reviewsLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Hydrating Feed...</p>
            </div>
          ) : productsError || reviewsError ? (
            <div className="py-24 text-center text-rose-500 font-bold text-sm">{productsError || reviewsError}</div>
          ) : (
            <div className="divide-y divide-gray-50">
              <ProductReviewList reviews={filteredReviews} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductReviews;