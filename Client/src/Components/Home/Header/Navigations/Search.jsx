import React, { useState, useEffect, useRef } from "react";
import { IoSearchOutline, IoArrowForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api";

const Search = () => {
  const [input, setInput] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        const res = await api.get("/api/client/search");
        setProducts(res.data.data || []);
      } catch (err) { console.error(err); }
    };
    fetchPreviewData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowResult(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (!val.trim()) { setShowResult(false); return; }
    const preview = products.filter(p => 
      p.title?.toLowerCase().includes(val.toLowerCase()) || 
      p.categoryname?.categoryname?.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 5);
    setFilteredProducts(preview);
    setShowResult(true);
  };

  // --- UPDATED LOGIC HERE ---
  const handleSearchTrigger = () => {
    const searchTerm = input.trim();
    if (!searchTerm) return;

    setShowResult(false);
    setInput(""); // Clears the input field immediately
    navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="w-full relative group z-[1001]" ref={wrapperRef}>
      <div className="flex items-center bg-[#FDFCFB] border border-gray-200/60 focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/5 transition-all duration-500 rounded-2xl px-6 py-3 shadow-sm hover:shadow-md">
        <IoSearchOutline className="text-gray-400 text-xl group-focus-within:text-[#C5A059] transition-colors duration-300" />
        <input
          type="text"
          placeholder="Search heritage treasures..."
          className="bg-transparent border-none focus:outline-none w-full px-4 text-[15px] font-medium text-gray-800 placeholder:text-gray-300 placeholder:italic"
          value={input}
          onChange={handleChange}
          onFocus={() => input && setShowResult(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchTrigger()}
        />
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Enter
        </div>
      </div>

      {showResult && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] border border-white overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white/40">
            <span className="text-[11px] font-black text-[#C5A059] uppercase tracking-[0.2em]">Suggested Finds</span>
            <span className="text-[10px] text-gray-400 font-medium">{filteredProducts.length} Results</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="p-2">
              {filteredProducts.map((p) => (
                <div 
                  key={p._id} 
                  onClick={() => { setInput(""); setShowResult(false); navigate(`/products/${p._id}`); }}
                  className="flex items-center gap-5 p-3 hover:bg-[#F9F7F2] rounded-2xl cursor-pointer transition-all duration-300 group/item"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-sm bg-gray-100 flex-shrink-0">
                    <img src={p.images?.[0]?.url} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-[14px] font-bold text-gray-800 mb-0.5 group-hover/item:text-[#0F3D2E] transition-colors">{p.title}</p>
                    <span className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest">{p.categoryname?.categoryname}</span>
                  </div>
                  <IoArrowForward className="text-gray-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                </div>
              ))}

              <button 
                onClick={handleSearchTrigger}
                className="w-full mt-2 py-4 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.25em] text-white bg-[#0F3D2E] rounded-2xl hover:bg-[#C5A059] hover:shadow-lg transition-all duration-500"
              >
                Discover All Masterpieces
                <IoArrowForward className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-[13px] font-serif italic text-gray-400">No treasures found matching "{input}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;