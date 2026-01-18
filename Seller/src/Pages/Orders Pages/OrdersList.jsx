import React, { useMemo, useState, useEffect, useRef } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { LuPackage, LuDownload, LuFileSpreadsheet, LuFileText, LuSearch, LuUser, LuMapPin, LuPhone, LuShoppingBag } from "react-icons/lu";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useSellerOrders } from "../../hooks/useSellerOrders.js";
import OrderSummaryCards from "../../Components/Orders/OrderSummaryCards.jsx";
import {
  filterOrdersByRange,
  filterOrdersByStatus,
  formatINR,
  ORDER_RANGE_TITLES,
  ORDER_STATUS_META,
} from "../../utils/orderMetrics.js";
import { exportToCSV, exportToExcel, ORDER_EXPORT_COLUMNS } from "../../utils/exportUtils.js";

const SORT_OPTIONS = {
  NONE: 'default',
  TOTAL_DESC: 'total_desc',
  TOTAL_ASC: 'total_asc',
};

// Unified Status Color Map for Table Accents and Badges
const STATUS_THEMES = {
  Pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", accent: "bg-amber-500" },
  Processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", accent: "bg-blue-500" },
  Shipped: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", accent: "bg-indigo-500" },
  Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", accent: "bg-emerald-500" },
  Cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", accent: "bg-rose-500" },
};

function OrdersList({ focusedRange: initialRange, statusKey }) {
  const [openRow, setOpenRow] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedRange, setSelectedRange] = useState(initialRange || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState(SORT_OPTIONS.NONE);
  const exportMenuRef = useRef(null);
  const { orders, setOrders, loading, error, stats } = useSellerOrders();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDetails = (i) => setOpenRow(openRow === i ? null : i);

  const updateOrderStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/api/seller/orders/${id}`, { status });
      if (data.success) {
        toast.success("Order status updated!");
        setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = useMemo(() => {
    let result = filterOrdersByRange(orders, selectedRange);
    result = filterOrdersByStatus(result, statusKey);

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(lowerQuery) ||
        order.shippingAddress?.name?.toLowerCase().includes(lowerQuery) ||
        order.shippingAddress?.phone?.includes(lowerQuery) ||
        order.shippingAddress?.pin?.toString().includes(lowerQuery)
      );
    }

    if (sort === SORT_OPTIONS.NONE) return result;

    return [...result].sort((a, b) => {
      const totalA = a.totalAmount;
      const totalB = b.totalAmount;
      return sort === SORT_OPTIONS.TOTAL_ASC ? totalA - totalB : totalB - totalA;
    });
  }, [orders, selectedRange, statusKey, sort, searchQuery]);

  const meta = statusKey ? ORDER_STATUS_META[statusKey] : null;
  const title = meta?.title || ORDER_RANGE_TITLES[selectedRange] || "Orders Overview";
  const subtitle = meta?.subtitle || (selectedRange ? "Detailed breakdown for the selected time period" : "Your complete order analytics");

  const handleRangeClick = (range) => setSelectedRange(prev => prev === range ? null : range);
  const handleSortChange = (e) => setSort(e.target.value);

  const handleExport = (format) => {
    const dataToExport = filteredOrders.length > 0 ? filteredOrders : orders;
    const filename = selectedRange ? `orders_${selectedRange}` : statusKey ? `orders_${statusKey}` : 'all_orders';
    format === 'csv' ? exportToCSV(dataToExport, filename, ORDER_EXPORT_COLUMNS) : exportToExcel(dataToExport, filename, ORDER_EXPORT_COLUMNS);
    setShowExportMenu(false);
    toast.success(`Orders exported successfully!`);
  };

  return (
    <div className="space-y-6 bg-slate-50/50 p-4 sm:p-10 rounded-3xl shadow-xl border border-white max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 pl-1 mt-2 font-medium">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 items-center">
          <div className="relative w-full sm:col-span-2 lg:w-72">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer, ID, Pin..."
              className="pl-10 pr-4 py-3 w-full border-none bg-white rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <select
              value={sort}
              onChange={handleSortChange}
              className="appearance-none block w-full px-5 py-3 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 hover:shadow-md focus:ring-2 focus:ring-indigo-500 pr-10 shadow-sm cursor-pointer transition-all"
            >
              <option value={SORT_OPTIONS.NONE}>Default Sorting</option>
              <option value={SORT_OPTIONS.TOTAL_DESC}>Price: High to Low</option>
              <option value={SORT_OPTIONS.TOTAL_ASC}>Price: Low to High</option>
            </select>
            <FaAngleDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 shadow-lg transition-all"
            >
              <LuDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-3 w-full sm:w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50">
                <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  <LuFileText className="w-5 h-5 text-indigo-500" /> Save as CSV
                </button>
                <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-emerald-50 transition-colors">
                  <LuFileSpreadsheet className="w-5 h-5 text-emerald-500" /> Save as Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderSummaryCards stats={stats} formatAmount={formatINR} focusedRange={selectedRange} onSelectRange={handleRangeClick} />

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Orders</span>
            </div>
          </div>
        ) : error ? (
          <div className="m-6 p-6 bg-rose-50 text-rose-700 rounded-2xl font-bold border border-rose-100 flex items-center gap-3">
             <LuPackage /> {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <LuPackage className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{meta?.emptyMessage || "No orders found."}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="w-16 px-6 py-5"></th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order ID</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Info</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Placement Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOrders.map((order, i) => {
                    const theme = STATUS_THEMES[order.status] || STATUS_THEMES.Pending;
                    const isExpanded = openRow === i;
                    return (
                      <React.Fragment key={order._id}>
                        <tr className={`group transition-all ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50/40'}`}>
                          <td className="px-6 py-5 text-center relative">
                            {/* Color Accent Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            <button onClick={() => toggleDetails(i)} className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}>
                              {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                            </button>
                          </td>
                          <td className="px-6 py-5 font-black text-slate-900 text-sm">#{order._id.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${theme.bg} ${theme.text}`}>
                                  {order.shippingAddress?.name?.charAt(0)}
                               </div>
                               <span className="font-bold text-slate-700 text-sm">{order.shippingAddress?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center font-black text-slate-900 text-base">{formatINR(order.totalAmount)}</td>
                          <td className="px-6 py-5 text-center">
                            <select
                              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none ring-1 ring-inset focus:ring-2 transition-all cursor-pointer ${theme.bg} ${theme.text} ring-${theme.border.split('-')[1]}-200`}
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            >
                              {Object.keys(STATUS_THEMES).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-5 text-center text-xs font-bold text-slate-400">
                            {new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                        {isExpanded && <ExpandedDetails order={order} formatINR={formatINR} theme={theme} />}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredOrders.map((order, i) => {
                const theme = STATUS_THEMES[order.status] || STATUS_THEMES.Pending;
                return (
                  <div key={order._id} className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">#{order._id.slice(-8).toUpperCase()}</p>
                        <h3 className="font-black text-slate-900">{order.shippingAddress?.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(order.placedAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-black text-slate-900 text-lg">{formatINR(order.totalAmount)}</p>
                        <select
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border-none ring-1 transition-all ${theme.bg} ${theme.text}`}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        >
                          {Object.keys(STATUS_THEMES).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleDetails(i)}
                      className="w-full py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      {openRow === i ? <><FaAngleUp /> Close Details</> : <><FaAngleDown /> View Logistics</>}
                    </button>

                    {openRow === i && (
                      <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <ExpandedDetails Mobile order={order} formatINR={formatINR} theme={theme} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExpandedDetails({ order, formatINR, Mobile = false, theme }) {
  const Container = Mobile ? "div" : "td";
  const innerProps = Mobile ? {} : { colSpan: 10, className: "bg-slate-50/50 px-4 sm:px-10 py-8" };

  return (
    <tr className={Mobile ? "block" : ""}>
      <Container {...innerProps}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Info Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <LuMapPin className="w-4 h-4 text-indigo-500" /> Delivery Details
            </h4>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <LuUser size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Recipient</p>
                    <p className="text-sm font-black text-slate-900">{order.shippingAddress?.name}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <LuMapPin size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Shipping Address</p>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed mt-1">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="font-black text-indigo-600">{order.shippingAddress?.pin}</span>
                    </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <LuPhone size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Contact Number</p>
                    <p className="text-sm font-black text-slate-900 tracking-widest">{order.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LuPackage className="text-orange-500" /> Order Manifest ({order.items.length})
              </h4>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50">
                  {order.items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={item.productId?.images?.[0]?.url || ""} 
                            className="w-12 h-12 rounded-2xl border border-slate-100 object-cover shrink-0 shadow-sm" 
                            alt="" 
                          />
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 truncate max-w-[150px]">{item.productId?.title || "Product Removed"}</p>
                            <p className="text-[10px] font-bold text-indigo-500">{formatINR(item.price)} per unit</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                         <span className="inline-block px-2 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">x{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{formatINR(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Net Payable</span>
                <span className="text-xl font-black">{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </Container>
    </tr>
  );
}

export default OrdersList;