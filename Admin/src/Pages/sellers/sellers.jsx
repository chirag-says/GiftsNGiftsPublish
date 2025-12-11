import React, { useEffect, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { LuStore, LuPackageOpen, LuSearch } from "react-icons/lu"; 
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";
import axios from "axios";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import SearchBox from "../../Components/SearchBox/SearchBox.jsx";

// Helper for dynamic avatar colors (kept for variety)
const getAvatarColor = (name) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-cyan-100 text-cyan-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-teal-100 text-teal-700",
  ];
  const index = name ? name.length % colors.length : 0;
  return colors[index];
};

function SellersList() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSellerIndex, setOpenSellerIndex] = useState(null);
  const [sellerProducts, setSellerProducts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSellers, setFilteredSellers] = useState([]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/sellers`
      );
      if (data.success) {
        setSellers(data.sellers);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerProducts = async (sellerId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/seller-products/${sellerId}`
      );
      if (data.success) {
        setSellerProducts((prev) => ({
          ...prev,
          [sellerId]: data.products,
        }));
      }
    } catch (error) {
      console.error("Error fetching seller products:", error);
    }
  };

  const toggleSellerRow = (index, sellerId) => {
    const newIndex = openSellerIndex === index ? null : index;
    setOpenSellerIndex(newIndex);
    if (newIndex !== null && !sellerProducts[sellerId]) {
      fetchSellerProducts(sellerId);
    }
  };

  const handleToggleApproveSeller = async (sellerId) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/toggle-approve/${sellerId}`
      );
      if (data.success) {
        setSellers((prev) =>
          prev.map((s) => (s._id === sellerId ? data.seller : s))
        );
      }
    } catch (error) {
      console.error("Error toggling seller approval:", error);
    }
  };

  const toggleApproveProduct = async (productId, sellerId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/toggle-product/${productId}`
      );
      if (res.data.success) {
        fetchSellerProducts(sellerId); // refresh product list
      }
    } catch (error) {
      console.error("Error toggling product approval:", error);
      alert("Failed to toggle product approval");
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSellers(sellers);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = sellers.filter(
        (seller) =>
          seller.name.toLowerCase().includes(lower) ||
          seller.nickName.toLowerCase().includes(lower) ||
          seller.email.toLowerCase().includes(lower)
      );
      setFilteredSellers(filtered);
    }
  }, [searchTerm, sellers]);

  useEffect(() => {
    fetchSellers();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-2xl shadow-blue-50 border border-blue-50 overflow-hidden my-6">
      
      {/* --- Blue Gradient Header Section --- */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 px-8 py-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <LuStore className="text-2xl text-white" />
            </div>
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Partner Sellers</h2>
                <p className="text-sm text-blue-100 font-medium opacity-90">Overview of registered vendors</p>
            </div>
        </div>

        {/* Search Box Wrapper */}
        <div className="w-full md:w-1/3">
             <div className="bg-white rounded-xl overflow-hidden shadow-lg shadow-blue-900/20">
                <SearchBox
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search seller name or email..."
                />
             </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <CircularProgress style={{ color: '#2563eb' }} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left border-collapse">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-[60px]">Details</th>
                <th className="px-6 py-4">Seller Identity</th>
                <th className="px-6 py-4">Store Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSellers.map((seller, index) => {
                  const isExpanded = openSellerIndex === index;
                  const avatarClass = getAvatarColor(seller.name);

                  return (
                    <React.Fragment key={seller._id}>
                      {/* --- Main Seller Row --- */}
                      <tr className={`transition-all duration-200 ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleSellerRow(index, seller._id)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 border
                                ${isExpanded ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'}
                            `}
                          >
                            {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                          </button>
                        </td>

                        {/* Name with Colored Avatar */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white ${avatarClass}`}>
                                    {seller.name?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-sm font-bold text-slate-700">{seller.name}</span>
                            </div>
                        </td>

                        <td className="px-6 py-4">
                            <span className="font-medium text-slate-600">{seller.nickName || "N/A"}</span>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                            {seller.email}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              seller.approved
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${seller.approved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {seller.approved ? "Active" : "Pending"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Button
                            size="small"
                            variant="contained"
                            disableElevation
                            style={{
                                backgroundColor: seller.approved ? "#fee2e2" : "#dbeafe",
                                color: seller.approved ? "#dc2626" : "#2563eb",
                                fontWeight: "bold",
                                textTransform: "none",
                                borderRadius: "8px",
                                padding: "6px 18px",
                                border: `1px solid ${seller.approved ? '#fecaca' : '#bfdbfe'}`
                            }}
                            onClick={() => handleToggleApproveSeller(seller._id)}
                          >
                            {seller.approved ? "Reject Access" : "Approve Seller"}
                          </Button>
                        </td>
                      </tr>

                      {/* --- Expanded Products View --- */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="p-0">
                            <div className="bg-slate-50/80 p-6 shadow-inner border-y border-slate-100">
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto">
                                
                                {/* Inner Header */}
                                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
                                            <LuPackageOpen size={18}/>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Seller Inventory</h3>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-medium">
                                        {sellerProducts[seller._id]?.length || 0} Items
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold">
                                      <tr>
                                        <th className="px-6 py-3">Image</th>
                                        <th className="px-6 py-3">Product Name</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Visibility</th>
                                        <th className="px-6 py-3 text-center">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                      {sellerProducts[seller._id]?.length > 0 ? (
                                        sellerProducts[seller._id].map((product) => (
                                          <tr key={product._id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-3">
                                              <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white p-0.5">
                                                  <img
                                                    src={product.images[0]?.url}
                                                    alt="Product"
                                                    className="w-full h-full object-contain rounded-md"
                                                  />
                                              </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <p className="font-semibold text-slate-700 max-w-[250px] truncate" title={product.title}>{product.title}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {product._id.slice(-6)}</p>
                                            </td>
                                            <td className="px-6 py-3 font-bold text-slate-600">₹{product.price}</td>
                                            <td className="px-6 py-3">
                                              <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                                  product.approved
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                                }`}
                                              >
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.approved ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {product.approved ? "Live" : "Hidden"}
                                              </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                              <Tooltip title={product.approved ? "Disapprove Product" : "Approve Product"} arrow>
                                                <button
                                                  onClick={() => toggleApproveProduct(product._id, seller._id)}
                                                  className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm hover:scale-110 active:scale-95
                                                    ${product.approved 
                                                        ? "bg-white border border-rose-200 text-rose-500 hover:bg-rose-50" 
                                                        : "bg-white border border-emerald-200 text-emerald-500 hover:bg-emerald-50"}
                                                  `}
                                                >
                                                  {product.approved ? <HiOutlineX size={16}/> : <HiOutlineCheck size={16}/>}
                                                </button>
                                              </Tooltip>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="5" className="text-center py-10 text-slate-400 italic">
                                            <LuPackageOpen className="mx-auto text-2xl mb-2 opacity-50"/>
                                            This seller has no products listed.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              {!filteredSellers.length && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                            <LuSearch className="text-2xl text-slate-300"/>
                        </div>
                        <p className="font-medium text-slate-600">No sellers match your search.</p>
                        <p className="text-sm text-slate-400">Try checking the spelling or use a different keyword.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SellersList;