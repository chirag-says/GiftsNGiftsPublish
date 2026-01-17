import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaAngleDown, FaAngleUp, FaCalendarAlt, FaSortAmountDown,
  FaMapMarkerAlt, FaPhoneAlt, FaUser, FaRedoAlt
} from "react-icons/fa";
import { HiOutlineClipboardList, HiOutlineRefresh, HiOutlineMail } from "react-icons/hi";
import { MdOutlinePayments, MdDoneAll, MdCancel } from "react-icons/md";
import Badges from "../../Components/DashbordBoxes/Badges.jsx";
import api from "../../utils/api";

const getAvatarColor = (name) => {
  const colors = [
    "bg-rose-50 text-rose-600 border-rose-200",
    "bg-emerald-50 text-emerald-600 border-emerald-200",
    "bg-sky-50 text-sky-600 border-sky-200",
    "bg-amber-50 text-amber-600 border-amber-200",
    "bg-violet-50 text-violet-600 border-violet-200",
    "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
  ];
  const index = name ? name.length % colors.length : 0;
  return colors[index];
};

function OrdersList() {
  const [isOpenOrderdProduct, setOpenOrderdProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [sortType, setSortType] = useState("Newest");
  const [selectedOrders, setSelectedOrders] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get("status");
    if (statusParam) setActiveTab(statusParam);
  }, [location.search]);

  const getOrders = async () => {
    try {
      const { data } = await api.get('/api/admin/orders');
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => { getOrders(); }, []);

  useEffect(() => {
    let temp = [...orders];
    if (activeTab !== "All") temp = temp.filter(order => order.status === activeTab);
    const now = new Date();
    temp = temp.filter(order => {
      const d = new Date(order.placedAt);
      if (dateFilter === "Today") return d.toDateString() === now.toDateString();
      if (dateFilter === "This Month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (dateFilter === "This Year") return d.getFullYear() === now.getFullYear();
      return true;
    });
    if (sortType === "Amount: High-Low") temp.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
    else if (sortType === "Amount: Low-High") temp.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
    else if (sortType === "Newest") temp.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
    else if (sortType === "Oldest") temp.sort((a, b) => new Date(a.placedAt) - new Date(b.placedAt));
    setFilteredOrders(temp);
  }, [orders, activeTab, dateFilter, sortType]);

  const resetFilters = () => {
    setActiveTab("All");
    setDateFilter("All Time");
    setSortType("Newest");
    setSelectedOrders([]);
    navigate("/orders", { replace: true });
  };

  const toggleOrderDetails = (index) => setOpenOrderdProduct(isOpenOrderdProduct === index ? null : index);
  const handleSelectAll = (e) => setSelectedOrders(e.target.checked ? filteredOrders.map(o => o._id) : []);
  const handleSelectRow = (id) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);

  const tabs = [
    { label: "All", value: "All", color: "bg-slate-800 text-white border-slate-800" },
    { label: "Pending", value: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Processing", value: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { label: "Shipped", value: "Shipped", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { label: "Delivered", value: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Cancelled", value: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 font-sans text-slate-800 max-w-[1600px] mx-auto">
      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard label="Total Orders" count={filteredOrders.length} icon={<HiOutlineClipboardList />} theme="blue" />
        <StatCard label="Pending Action" count={filteredOrders.filter(o => ['Pending', 'Processing'].includes(o.status)).length} icon={<HiOutlineRefresh />} theme="amber" />
        <StatCard label="Completed" count={filteredOrders.filter(o => o.status === 'Delivered').length} icon={<MdDoneAll />} theme="emerald" />
        <StatCard label="Cancelled" count={filteredOrders.filter(o => o.status === 'Cancelled').length} icon={<MdCancel />} theme="rose" />
      </div>

      {/* 2. Main Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header Filters */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-white">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap border ${activeTab === tab.value ? tab.color : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative flex-1 min-w-[140px] sm:flex-none">
                <FaSortAmountDown className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={12} />
                <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="w-full sm:w-auto pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 appearance-none outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Amount: High-Low">Price: High-Low</option>
                  <option value="Amount: Low-High">Price: Low-High</option>
                </select>
              </div>

              <div className="relative flex-1 min-w-[140px] sm:flex-none">
                <FaCalendarAlt className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={12} />
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 appearance-none outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="All Time">All Time</option>
                  <option value="Today">Today</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>

              <button onClick={resetFilters} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-50 transition-colors">
                <FaRedoAlt /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* 3. Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px] lg:min-w-full">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <th className="px-4 py-4 w-[50px]"></th>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4 hidden md:table-cell">Customer</th>
                <th className="px-6 py-4 hidden sm:table-cell">Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 hidden xl:table-cell text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const isExpanded = isOpenOrderdProduct === index;
                  const isSelected = selectedOrders.includes(order._id);

                  return (
                    <React.Fragment key={order._id}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                        
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => toggleOrderDetails(index)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isExpanded ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}>
                            {isExpanded ? <FaAngleUp size={12} /> : <FaAngleDown size={12} />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${getAvatarColor(order.shippingAddress?.name)}`}>
                              {order.shippingAddress?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{order.shippingAddress?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${order.paymentId ? 'text-violet-600 bg-violet-50 border-violet-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                            {order.paymentId ? 'Online' : 'COD'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4"><div className="flex justify-center scale-90"><Badges status={order.status} /></div></td>
                        <td className="px-6 py-4 hidden xl:table-cell text-right text-xs text-slate-500 font-medium">
                          {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="8" className="p-0 bg-slate-50/30">
                            <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">
                              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col lg:flex-row shadow-xl shadow-slate-200/50">
                                <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-100 p-6 sm:p-8">
                                  <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Ordered Items</h4>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black">{order.items?.length} SKUs</span>
                                  </div>
                                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {order.items?.map((item) => (
                                      <div key={item._id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                                        <div className="flex items-center gap-4 min-w-0">
                                          <img src={item.image || order.image || "/placeholder.png"} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-100" />
                                          <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">{item.productId?.title || "Removed Item"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">₹{item.price} × {item.quantity}</p>
                                          </div>
                                        </div>
                                        <p className="text-sm font-black text-indigo-600 ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="w-full lg:w-[380px] bg-slate-50/50 p-6 sm:p-8 space-y-8">
                                  <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-500" /> Destination</h4>
                                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-125 transition-transform"><FaMapMarkerAlt size={40}/></div>
                                      <p className="font-black text-sm text-slate-800 mb-1">{order.shippingAddress?.name}</p>
                                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                                        {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                      </p>
                                      <span className="inline-block px-3 py-1 bg-indigo-600 text-white rounded-lg text-[11px] font-black shadow-lg shadow-indigo-100">PIN: {order.shippingAddress?.pincode || order.shippingAddress?.zipCode || "N/A"}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><FaUser className="text-indigo-500" /> Contact Detail</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FaPhoneAlt size={12}/></div>
                                        <span className="text-xs font-bold text-slate-600">{order.shippingAddress?.phone}</span>
                                      </div>
                                      {order.shippingAddress?.email && (
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><HiOutlineMail size={16}/></div>
                                          <span className="text-xs font-bold text-slate-600 truncate">{order.shippingAddress.email}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <HiOutlineClipboardList size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-slate-400">Inventory Ledger Empty</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, count, icon, theme }) => {
  const themes = {
    blue: "bg-white border-slate-200 text-indigo-600",
    amber: "bg-white border-slate-200 text-amber-500",
    emerald: "bg-white border-slate-200 text-emerald-600",
    rose: "bg-white border-slate-200 text-rose-500",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{count}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 shadow-lg ${themes[theme].split(' ')[2].replace('text-', 'bg-')}/10 ${themes[theme].split(' ')[2]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;