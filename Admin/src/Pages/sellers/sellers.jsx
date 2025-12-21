import React, { useEffect, useState, useMemo, useCallback } from "react";
import { FaAngleDown, FaAngleUp, FaPhoneAlt, FaEnvelope, FaEdit, FaCheck } from "react-icons/fa";
import { LuStore, LuPackageOpen, LuSearch, LuClipboardList, LuWallet, LuMapPin } from "react-icons/lu";
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";
import api from "../../utils/api";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import SearchBox from "../../Components/SearchBox/SearchBox.jsx";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

// Helper for random avatar colors
const getAvatarColor = (name) => {
  const colors = [
    "bg-blue-100 text-blue-700", "bg-indigo-100 text-indigo-700",
    "bg-cyan-100 text-cyan-700", "bg-sky-100 text-sky-700",
  ];
  return colors[name ? name.length % colors.length : 0];
};

function SellersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSellerIndex, setOpenSellerIndex] = useState(null);
  const [sellerProducts, setSellerProducts] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 3. New State for Region Filter
  const [regionFilter, setRegionFilter] = useState("");
  const [uniqueRegions, setUniqueRegions] = useState([]);

  // Commission Edit State
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [tempCommission, setTempCommission] = useState(0);

  // Inactivity insights
  const [inactiveSellers, setInactiveSellers] = useState([]);
  const [inactiveLoading, setInactiveLoading] = useState(false);
  const [inactiveThreshold, setInactiveThreshold] = useState(30);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "1") setActiveTab("pending");
    else if (tabParam === "2") setActiveTab("active");
    else setActiveTab("all");
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    let tabIndex = "0";
    if (newTab === "pending") tabIndex = "1";
    if (newTab === "active") tabIndex = "2";
    setSearchParams({ tab: tabIndex });
  };

  // --- 1. & 3. FETCH SELLERS (Updated for Search & Region) ---
  const fetchSellers = async (query = "", region = "") => {
    try {
      setLoading(true);
      const { data } = await api.get(
        '/api/admin/sellers',
        { params: { search: query, region: region } }
      );
      if (data.success) {
        setSellers(data.sellers);

        // Populate unique regions dropdown if not set
        if (uniqueRegions.length === 0 && data.sellers.length > 0) {
          const regions = [...new Set(data.sellers.map(s => s.region).filter(Boolean))];
          setUniqueRegions(regions);
        }
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSellers(searchTerm, regionFilter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, regionFilter]);

  const fetchInactiveSellers = useCallback(async (minDays = 30) => {
    try {
      setInactiveLoading(true);
      const { data } = await api.get(
        '/api/admin/sellers/inactivity',
        { params: { minDays } }
      );
      if (data.success) {
        setInactiveSellers(data.sellers || []);
      }
    } catch (error) {
      console.error("Error fetching inactive sellers:", error);
      toast.error("Failed to fetch inactivity report");
    } finally {
      setInactiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInactiveSellers(inactiveThreshold);
  }, [fetchInactiveSellers, inactiveThreshold]);

  // --- 8. Existing Product Fetch Logic Preserved ---
  const fetchSellerProducts = async (sellerId) => {
    try {
      const { data } = await api.get(
        `/api/admin/seller-products/${sellerId}`
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
      const { data } = await api.put(
        `/api/admin/toggle-approve/${sellerId}`
      );
      if (data.success) {
        setSellers((prev) =>
          prev.map((s) => (s._id === sellerId ? { ...s, approved: data.seller.approved } : s))
        );
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleUpdateCommission = async (sellerId) => {
    try {
      const { data } = await api.put(
        `/api/admin/seller-commission/${sellerId}`,
        { commissionRate: tempCommission }
      );
      if (data.success) {
        setSellers((prev) =>
          prev.map((s) => (s._id === sellerId ? { ...s, commissionRate: tempCommission } : s))
        );
        setEditingCommissionId(null);
        toast.success("Commission updated");
      }
    } catch (error) {
      toast.error("Failed to update commission");
    }
  };

  const toggleApproveProduct = async (productId, sellerId) => {
    try {
      const res = await api.put(
        `/api/admin/toggle-product/${productId}`
      );
      if (res.data.success) {
        setSellerProducts((prev) => ({
          ...prev,
          [sellerId]: prev[sellerId].map((product) =>
            product._id === productId ? { ...product, approved: !product.approved } : product
          )
        }));
        toast.success("Product status updated");
      }
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  // --- FILTERING LOGIC ---
  const filteredSellers = useMemo(() => {
    if (activeTab === 'active') return sellers.filter(s => s.approved);
    if (activeTab === 'pending') return sellers.filter(s => !s.approved);
    return sellers;
  }, [sellers, activeTab]);

  const topInactiveSellers = useMemo(() => inactiveSellers.slice(0, 5), [inactiveSellers]);
  const longestInactive = topInactiveSellers[0]?.inactiveDays || 0;
  const formatShortDate = (value) => value ? new Date(value).toLocaleDateString() : '—';


  return (
    <div className="bg-white rounded-xl shadow-2xl shadow-blue-50 border border-blue-50 overflow-hidden my-6">

      {/* --- Header Section --- */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-700 px-8 py-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <LuStore className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Partner Sellers</h2>
              <p className="text-sm text-blue-100 opacity-80">Manage vendors, approvals, and commissions.</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-1/2">
            {/* 3. REGION FILTER DROPDOWN */}
            <select
              className="bg-white text-gray-700 rounded-xl px-4 py-2 focus:outline-none w-1/3 text-sm font-medium"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="">All Regions</option>
              {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* 2. SEARCH BOX (Updated) */}
            <div className="w-2/3 bg-white rounded-xl overflow-hidden shadow-lg">
              <SearchBox
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                placeholder="Search by ID, Name, Email..."
              />
            </div>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="flex items-center gap-4 mt-8 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {[
            { id: 'all', label: 'All Vendors' },
            { id: 'active', label: 'Active Vendors' },
            { id: 'pending', label: 'Pending Approvals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-lg scale-105' : 'bg-white/10 text-blue-100 hover:bg-white/20'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-8 border-b border-slate-100 bg-white">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 shadow-sm bg-gradient-to-br from-white to-slate-50">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Inactivity watchlist</p>
                <h3 className="text-xl font-bold text-slate-800">Sellers without fresh listings</h3>
                <p className="text-sm text-slate-500">Monitor who needs a nudge before their storefront gets suspended.</p>
              </div>
              <div className="flex gap-3 items-center">
                <select
                  value={inactiveThreshold}
                  onChange={(e) => setInactiveThreshold(Number(e.target.value))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white"
                >
                  {[30, 45, 60, 90].map((days) => (
                    <option key={days} value={days}>{days}+ days</option>
                  ))}
                </select>
                <button
                  onClick={() => fetchInactiveSellers(inactiveThreshold)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-400"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-4">
              {inactiveLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-14 rounded-xl bg-slate-200/60" />
                  ))}
                </div>
              ) : topInactiveSellers.length ? (
                <ul className="divide-y divide-slate-100">
                  {topInactiveSellers.map((seller) => (
                    <li key={seller._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{seller.name} <span className="text-xs text-slate-400 font-mono">{seller.uniqueId}</span></p>
                        <p className="text-xs text-slate-500 flex flex-wrap gap-3">
                          <span>{seller.email}</span>
                          <span>{seller.region || 'No region'}</span>
                          <span>Last listing: {formatShortDate(seller.lastListing)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-rose-600">{seller.inactiveDays}d</p>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Inactive</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No sellers exceeded {inactiveThreshold} days of inactivity.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Flagged sellers</p>
              <h3 className="text-4xl font-black mt-3">{inactiveSellers.length}</h3>
              <p className="text-sm text-white/70 mt-2">Longer than {inactiveThreshold} days without a new product.</p>
            </div>
            <div className="mt-6 space-y-2 text-sm text-white/80">
              <p><span className="text-white font-semibold text-2xl">{longestInactive}</span> day longest gap</p>
              <p>Latest warning sent: {inactiveSellers[0]?.lastNotificationSentAt ? formatShortDate(inactiveSellers[0].lastNotificationSentAt) : '—'}</p>
            </div>
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
                <th className="px-6 py-4 w-[50px]">View</th>
                <th className="px-6 py-4">ID & Region</th> {/* 5. Unique ID Column */}
                <th className="px-6 py-4">Seller Details</th>
                <th className="px-6 py-4">Last Active</th> {/* 4. Inactivity Track */}
                <th className="px-6 py-4">Commission (%)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSellers.map((seller, index) => {
                const isExpanded = openSellerIndex === index;
                const avatarClass = getAvatarColor(seller.name);

                return (
                  <React.Fragment key={seller._id}>
                    <tr className={`transition-all duration-200 ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                      {/* Expand Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleSellerRow(index, seller._id)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all border ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}
                        >
                          {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                      </td>

                      {/* 5. & 3. DISPLAY UNIQUE ID & REGION */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit text-xs border border-blue-100">
                            {seller.uniqueId || 'NO-ID'}
                          </span>
                          <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <LuMapPin size={12} /> {seller.region || seller.address?.city || 'No Region'}
                          </span>
                        </div>
                      </td>

                      {/* Seller Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${avatarClass}`}>
                            {seller.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{seller.name}</span>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <FaEnvelope className="text-slate-400" /> {seller.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <FaPhoneAlt className="text-slate-400" /> {seller.phone || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 4. LAST ACTIVE / JOINING DATE */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 font-medium">
                          {seller.lastLogin ? new Date(seller.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Joined: {new Date(seller.date).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Commission */}
                      <td className="px-6 py-4">
                        {editingCommissionId === seller._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={tempCommission}
                              onChange={(e) => setTempCommission(e.target.value)}
                              className="w-16 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button onClick={() => handleUpdateCommission(seller._id)} className="p-1 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100"><FaCheck size={14} /></button>
                            <button onClick={() => setEditingCommissionId(null)} className="p-1 text-rose-600 bg-rose-50 rounded hover:bg-rose-100"><HiOutlineX size={14} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                            setTempCommission(seller.commissionRate || 0);
                            setEditingCommissionId(seller._id);
                          }}>
                            <span className="font-bold text-slate-700">{seller.commissionRate || 0}%</span>
                            <FaEdit className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${seller.approved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                          {seller.approved ? "Active" : "Pending"}
                        </span>
                      </td>

                      {/* Action */}
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
                          }}
                          onClick={() => handleToggleApproveSeller(seller._id)}
                        >
                          {seller.approved ? "Suspend" : "Approve"}
                        </Button>
                      </td>
                    </tr>

                    {/* --- Expanded Products View (Preserved) --- */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className="bg-slate-50/80 p-6 shadow-inner border-y border-slate-100">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-5xl mx-auto">
                              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-50 rounded-md text-blue-600"><LuPackageOpen size={18} /></div>
                                  <h3 className="text-xs font-bold text-slate-800 uppercase">Seller Inventory</h3>
                                </div>
                                <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-medium">
                                  {sellerProducts[seller._id]?.length || 0} Items
                                </span>
                              </div>

                              <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-xs text-slate-400 uppercase font-semibold sticky top-0">
                                    <tr>
                                      <th className="px-6 py-3">Image</th>
                                      <th className="px-6 py-3">Product Name</th>
                                      <th className="px-6 py-3">Price</th>
                                      <th className="px-6 py-3">Status</th>
                                      <th className="px-6 py-3 text-center">Moderation</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {sellerProducts[seller._id]?.length > 0 ? (
                                      sellerProducts[seller._id].map((product) => (
                                        <tr key={product._id} className="hover:bg-blue-50/30">
                                          <td className="px-6 py-3">
                                            <img src={product.images[0]?.url} alt="" className="w-10 h-10 object-contain rounded border border-slate-200" />
                                          </td>
                                          <td className="px-6 py-3">
                                            <p className="font-medium text-slate-700 truncate max-w-[200px]">{product.title}</p>
                                          </td>
                                          <td className="px-6 py-3 font-bold text-slate-600">₹{product.price}</td>
                                          <td className="px-6 py-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border ${product.approved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                              {product.approved ? 'Live' : 'Hidden'}
                                            </span>
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <Tooltip title={product.approved ? "Disapprove" : "Approve"}>
                                              <button onClick={() => toggleApproveProduct(product._id, seller._id)} className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${product.approved ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-500 hover:bg-green-50'}`}>
                                                {product.approved ? <HiOutlineX size={14} /> : <HiOutlineCheck size={14} />}
                                              </button>
                                            </Tooltip>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr><td colSpan="5" className="text-center py-6 text-slate-400 italic">No products listed.</td></tr>
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
            </tbody>
          </table>
          {!filteredSellers.length && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <LuSearch className="text-4xl text-slate-200 mb-3" />
              <p>No sellers found matching "{searchTerm}" or selected tab/region.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SellersList;