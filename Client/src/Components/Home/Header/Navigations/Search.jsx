import React, { useState, useEffect, useRef } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import api from '../../../../utils/api';

const Search = () => {
  const [input, setInput] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/client/search');
        setProducts(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResult(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    if (!val.trim()) { setFilteredProducts([]); setShowResult(false); return; }

    const filtered = products.filter(p =>
      p.title?.toLowerCase().includes(val.toLowerCase()) ||
      p.categoryname?.name?.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 8); // Limit results for speed

    setFilteredProducts(filtered);
    setShowResult(true);
  };

  // Handle Enter key press - navigate and close dropdown
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      setShowResult(false); // Close dropdown
      navigate(`/search-results?query=${input}`);
    }
  };

  // Handle "View All Results" click
  const handleViewAllResults = () => {
    setShowResult(false); // Close dropdown
    navigate(`/search-results?query=${input}`);
  };

  return (
    <div className="w-full relative group" ref={wrapperRef}>
      <div className="flex items-center bg-gray-100 group-focus-within:bg-white group-focus-within:ring-2 ring-purple-200 transition-all rounded-full px-4 py-2">
        <IoSearchSharp className="text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search for unique gifts..."
          className="bg-transparent border-none focus:outline-none w-full px-3 py-1 text-sm md:text-base text-gray-700"
          value={input}
          onChange={handleChange}
          onFocus={() => input && setShowResult(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* SEARCH RESULTS DROPDOWN */}
      {showResult && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[1001]">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              onClick={() => { navigate(`/products/${p._id}`); setShowResult(false); setInput(""); }}
              className="flex items-center gap-3 p-3 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
            >
              <img src={p.images?.[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title}</p>
                <p className="text-[10px] text-purple-600 font-bold uppercase">{p.categoryname?.name}</p>
              </div>
            </div>
          ))}
          <div
            onClick={handleViewAllResults}
            className="p-3 text-center text-xs text-[#7d0492] font-bold bg-gray-50 cursor-pointer hover:bg-purple-100"
          >
            View All Results
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
