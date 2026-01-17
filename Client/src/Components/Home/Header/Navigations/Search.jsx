import React, { useState, useEffect, useRef } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api";

const Search = () => {
  const [input, setInput] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null); // ✅ FIX: missing ref

  /* =========================
     1. Fetch preview data
  ========================= */
  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        const res = await api.get("/api/client/search");
        setProducts(res.data.data || []);
      } catch (err) {
        console.error("Search Preview Error:", err);
      }
    };
    fetchPreviewData();
  }, []);

  /* =========================
     2. Close dropdown on outside click
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResult(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     3. Input change
  ========================= */
  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (!val.trim()) {
      setFilteredProducts([]);
      setShowResult(false);
      return;
    }

    const preview = products
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(val.toLowerCase()) ||
          p.categoryname?.categoryname
            ?.toLowerCase()
            .includes(val.toLowerCase())
      )
      .slice(0, 8);

    setFilteredProducts(preview);
    setShowResult(true);
  };

  /* =========================
     4. Search trigger (ENTER / View All)
  ========================= */
  const handleSearchTrigger = () => {
    if (!input.trim()) return;

    const searchTerm = input.trim();

    // ✅ Close dropdown
    setShowResult(false);

    // ✅ Clear input
    setInput("");

    // ✅ Remove focus (IMPORTANT)
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // ✅ Navigate
    navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <div className="flex items-center bg-gray-100 focus-within:bg-white focus-within:ring-2 ring-purple-200 transition-all rounded-full px-4 py-2">
        <IoSearchSharp className="text-gray-400 text-xl" />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search for unique gifts..."
          className="bg-transparent border-none focus:outline-none w-full px-3 py-1 text-sm md:text-base text-gray-700"
          value={input}
          onChange={handleChange}
          onFocus={() => input && setShowResult(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchTrigger();
            }
          }}
        />
      </div>

      {/* 🔽 SEARCH DROPDOWN */}
      {showResult && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1001]">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              onClick={() => {
                setInput("");
                setShowResult(false);
                navigate(`/products/${p._id}`);
              }}
              className="flex items-center gap-3 p-3 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
            >
              <img
                src={p.images?.[0]?.url}
                alt={p.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                  {p.title}
                </p>
                <p className="text-[10px] text-purple-600 font-bold uppercase">
                  {p.categoryname?.categoryname}
                </p>
              </div>
            </div>
          ))}

          {/* 🔍 View All */}
          <div
            onClick={handleSearchTrigger}
            className="p-3 text-center text-xs text-[#7d0492] font-bold bg-gray-50 cursor-pointer hover:bg-purple-100"
          >
            View All Results for "{input}"
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
