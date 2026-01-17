import React, { useMemo, useState, useEffect, useRef } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { LuPackage, LuDownload, LuFileSpreadsheet, LuFileText, LuSearch, LuUser, LuMapPin, LuPhone } from "react-icons/lu";
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

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-amber-50 text-amber-700 border-amber-100",
      Processing: "bg-blue-50 text-blue-700 border-blue-100",
      Shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
      Delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Cancelled: "bg-red-50 text-red-700 border-red-100",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  const handleExport = (format) => {
    const dataToExport = filteredOrders.length > 0 ? filteredOrders : orders;
    const filename = selectedRange ? `orders_${selectedRange}` : statusKey ? `orders_${statusKey}` : 'all_orders';
    format === 'csv' ? exportToCSV(dataToExport, filename, ORDER_EXPORT_COLUMNS) : exportToExcel(dataToExport, filename, ORDER_EXPORT_COLUMNS);
    setShowExportMenu(false);
    toast.success(`Orders exported successfully!`);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Page Header - Improved stacking on mobile */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Controls Container - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 items-center">
          <div className="relative w-full sm:col-span-2 lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LuSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search ID, Name..."
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <select
              value={sort}
              onChange={handleSortChange}
              className="appearance-none block w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:ring-indigo-500 pr-10 shadow-sm"
            >
              <option value={SORT_OPTIONS.NONE}>Default Sorting</option>
              <option value={SORT_OPTIONS.TOTAL_DESC}>Price: High to Low</option>
              <option value={SORT_OPTIONS.TOTAL_ASC}>Price: Low to High</option>
            </select>
            <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative w-full" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <LuDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <LuFileText className="w-4 h-4 text-gray-400" /> CSV
                </button>
                <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <LuFileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderSummaryCards stats={stats} formatAmount={formatINR} focusedRange={selectedRange} onSelectRange={handleRangeClick} />

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Loading orders...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <LuPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{meta?.emptyMessage || "No orders found."}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="w-12 px-4 py-4"></th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order, i) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => toggleDetails(i)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                            {openRow === i ? <FaAngleUp /> : <FaAngleDown />}
                          </button>
                        </td>
                        <td className="px-4 py-4 font-medium text-sm text-gray-900">#{order._id.slice(-8)}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{order.shippingAddress?.name}</td>
                        <td className="px-4 py-4 text-center font-semibold text-gray-900">{formatINR(order.totalAmount)}</td>
                        <td className="px-4 py-4 text-center">
                          <select
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none transition-all ${getStatusBadge(order.status)}`}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          >
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-600">
                          {new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                      {openRow === i && <ExpandedDetails order={order} formatINR={formatINR} />}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on Desktop) */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredOrders.map((order, i) => (
                <div key={order._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-indigo-600 mb-1">#{order._id.slice(-8)}</p>
                      <h3 className="font-semibold text-gray-900">{order.shippingAddress?.name}</h3>
                      <p className="text-xs text-gray-500">{new Date(order.placedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatINR(order.totalAmount)}</p>
                      <select
                        className={`mt-1 px-2 py-1 rounded text-[10px] font-bold border uppercase transition-all ${getStatusBadge(order.status)}`}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleDetails(i)}
                    className="w-full py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 flex items-center justify-center gap-1"
                  >
                    {openRow === i ? <><FaAngleUp /> Hide Details</> : <><FaAngleDown /> View Items & Shipping</>}
                  </button>

                  {openRow === i && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                       <ExpandedDetails Mobile order={order} formatINR={formatINR} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Sub-component for expanded area to avoid repetition
function ExpandedDetails({ order, formatINR, Mobile = false }) {
  const Container = Mobile ? "div" : "td";
  const innerProps = Mobile ? {} : { colSpan: 10, className: "bg-gray-50/50 px-4 sm:px-6 py-5" };

  return (
    <tr className={Mobile ? "block" : ""}>
      <Container {...innerProps}>
        <div className="space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <LuMapPin className="w-3.5 h-3.5" /> Shipping Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <LuUser className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="text-sm font-medium">{order.shippingAddress?.name}</p>
                </div>
              </div>
              <div className="flex gap-3 sm:col-span-2 lg:col-span-1">
                <LuMapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pin}
                    </p>
                </div>
              </div>
              <div className="flex gap-3">
                <LuPhone className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-sm font-medium">{order.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table - Scrollable on very small screens */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700">Order Items ({order.items.length})</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/30 text-gray-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.productId?.images?.[0]?.url || ""} 
                            className="w-10 h-10 rounded border object-cover shrink-0 bg-gray-50" 
                            alt="" 
                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-xs">{item.productId?.title || "Product Removed"}</p>
                            <p className="text-[10px] text-gray-400">Price: {formatINR(item.price)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatINR(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>
    </tr>
  );
}

export default OrdersList;