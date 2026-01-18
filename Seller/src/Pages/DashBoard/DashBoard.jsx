import React, { useContext, useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiArrowRight,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiFilter,
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiEye,
  FiBarChart2,
  FiPieChart,
  FiTrendingDown,
  FiX,
} from "react-icons/fi";
import { LuFileSpreadsheet, LuFileText, LuPackage } from "react-icons/lu";
import { MyContext } from "../../App.jsx";
import { useSellerOrders } from "../../hooks/useSellerOrders.js";
import { useSellerProducts } from "../../hooks/useSellerProducts.js";
import { formatINR } from "../../utils/orderMetrics.js";
import { useNavigate } from "react-router-dom";
import {
  exportToCSV,
  exportToExcel,
  RECENT_ORDERS_COLUMNS,
  DASHBOARD_STATS_COLUMNS,
} from "../../utils/exportUtils.js";
import {
  FiCheckCircle,
  FiTruck,
  FiSettings,
  FiClock,
  FiXCircle,
  FiRefreshCcw,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import OrdersBarChart from "./OrdersBarChart.jsx";
import RevenueAreaChart from "./RevenueAreaChart.jsx";
function DashBoard() {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  const navigate = useNavigate();
  const { orders, setOrders, loading, error, stats } = useSellerOrders();
  const {
    products,
    loading: productsLoading,
    refresh: refreshProducts,
  } = useSellerProducts();
  const recentOrders = orders.slice(0, 5);
  const recentProducts = products.slice(0, 5);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const exportMenuRef = useRef(null);

  // Seller Profile State
  const [sellerProfile, setSellerProfile] = useState({ name: "", nickName: "" });

  // Onboarding Status State
  const [onboardingStatus, setOnboardingStatus] = useState({
    completionPercentage: 100,
    status: 'Active',
    onboardingCompleted: true,
    showBanner: false
  });

  // Fetch seller profile and onboarding status
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const { data } = await api.get("/api/seller/profile");
        if (data.success) {
          setSellerProfile({
            name: data.seller?.name || "",
            nickName: data.seller?.nickName || ""
          });
        }
      } catch (error) {
        console.error("Failed to load seller profile", error);
      }
    };

    const fetchOnboardingStatus = async () => {
      try {
        const { data } = await api.get("/api/seller/onboarding/status");
        if (data.success) {
          const { completionPercentage, status, onboardingCompleted, verificationStatus } = data.data;

          // Only show banner if:
          // 1. Onboarding is NOT complete, OR
          // 2. Status is Pending or UnderReview (not Active/Verified)
          const shouldShowBanner = !onboardingCompleted ||
            status === 'Pending' ||
            status === 'UnderReview';

          setOnboardingStatus({
            completionPercentage: completionPercentage || 0,
            status: status || 'Pending',
            onboardingCompleted: onboardingCompleted || false,
            verificationStatus: verificationStatus || {},
            showBanner: shouldShowBanner
          });
        }
      } catch (error) {
        console.error("Failed to load onboarding status", error);
      }
    };

    fetchSellerProfile();
    fetchOnboardingStatus();
  }, []);

  // Filter orders based on search
  const filteredOrders = orders.filter(
    (order) =>
      order._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.shippingAddress?.name
        ?.toLowerCase()
        .includes(orderSearch.toLowerCase())
  );

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.brand?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Calculate product stats
  const productStats = {
    total: products.length,
    active: products.filter((p) => p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
  };

  // Calculate order stats by status
  const orderStatusStats = {
    pending: orders.filter((o) => o.status === "Pending" || o.status === "New")
      .length,
    processing: orders.filter((o) => o.status === "Processing").length,
    shipped: orders.filter((o) => o.status === "Shipped").length,
    delivered: orders.filter(
      (o) => o.status === "Delivered" || o.status === "Completed"
    ).length,
    cancelled: orders.filter(
      (o) => o.status === "Cancelled" || o.status === "Returned"
    ).length,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportDashboard = (format) => {
    // Prepare stats data for export
    const statsData = [
      {
        period: "Today",
        orders: stats?.today?.count || 0,
        revenue: stats?.today?.total || 0,
      },
      {
        period: "This Month",
        orders: stats?.month?.count || 0,
        revenue: stats?.month?.total || 0,
      },
      {
        period: "This Year",
        orders: stats?.year?.count || 0,
        revenue: stats?.year?.total || 0,
      },
      {
        period: "All Time",
        orders: stats?.overall?.count || 0,
        revenue: stats?.overall?.total || 0,
      },
    ];

    if (format === "csv") {
      exportToCSV(statsData, "dashboard_stats", DASHBOARD_STATS_COLUMNS);
    } else {
      exportToExcel(statsData, "dashboard_stats", DASHBOARD_STATS_COLUMNS);
    }
    setShowExportMenu(false);
  };

  const handleExportRecentOrders = (format) => {
    if (format === "csv") {
      exportToCSV(recentOrders, "recent_orders", RECENT_ORDERS_COLUMNS);
    } else {
      exportToExcel(recentOrders, "recent_orders", RECENT_ORDERS_COLUMNS);
    }
    setShowExportMenu(false);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Delivered: "bg-green-100 text-green-800 border-green-200",
      Shipped: "bg-blue-100 text-blue-800 border-blue-200",
      Processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Pending: "bg-gray-100 text-gray-800 border-gray-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
      Returned: "bg-red-100 text-red-800 border-red-200",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      Delivered: <FiCheckCircle className="text-green-600" />,
      Shipped: <FiTruck className="text-blue-600" />,
      Processing: <FiSettings className="text-yellow-600" />,
      Pending: <FiClock className="text-gray-500" />,
      Cancelled: <FiXCircle className="text-red-600" />,
      Returned: <FiRefreshCcw className="text-orange-600" />,
    };
    return statusIcons[status] || <FiClock />;
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const { data } = await api.put(`/api/seller/orders/${orderId}`, {
        status: newStatus,
      });

      if (data.success) {
        toast.success(`Order status updated to ${newStatus}!`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        // Update selected order if it's the same
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (productId) => {
    try {
      setDeletingProduct(true);
      const { data } = await api.delete(`/api/product/delete/${productId}`);

      if (data.success) {
        toast.success("Product deleted successfully!");
        setDeleteConfirm(null);
        refreshProducts(); // Refresh the products list
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product");
    } finally {
      setDeletingProduct(false);
    }
  };
  const statusData = [
    { name: "Pending", value: orderStatusStats.pending, color: "#F59E0B" }, // Amber
    {
      name: "Processing",
      value: orderStatusStats.processing,
      color: "#3B82F6",
    }, // Blue
    { name: "Shipped", value: orderStatusStats.shipped, color: "#8B5CF6" }, // Purple
    { name: "Delivered", value: orderStatusStats.delivered, color: "#10B981" }, // Emerald
    { name: "Cancelled", value: orderStatusStats.cancelled, color: "#EF4444" }, // Red
  ].filter((item) => item.value > 0); // Only show statuses that have orders

  // View product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  // Edit product - opens the Add Product panel
  const handleEditProduct = (product) => {
    // Navigate to products page with edit mode
    navigate(`/products?edit=${product._id}`);
  };
  // Pehle wale redundant stats definition ko hata kar direct variable banayein
  const orderSummaryChartData = [
    {
      label: "Today",
      orders: stats?.today?.count || 0,
      revenue: stats?.today?.total || 0,
      color: "#6366F1", // Indigo
    },
    {
      label: "This Month",
      orders: stats?.month?.count || 0,
      revenue: stats?.month?.total || 0,
      color: "#22C55E", // Green
    },
    {
      label: "This Year",
      orders: stats?.year?.count || 0,
      revenue: stats?.year?.total || 0,
      color: "#F59E0B", // Amber
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
         
        {/* Optimized Modern Header */}
        <header className="bg-white/80 backdrop-blur-md rounded-md  z-40 border-b border-gray-100 shadow-sm">
          <div className="max-w-[1600px] mx-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Title Section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                      Seller Dashboard
                    </h1>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-3">
                    Welcome back, {sellerProfile.nickName || sellerProfile.name || "Seller"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <div className="relative" ref={exportMenuRef}>
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 shadow-sm"
                    >
                      <FiDownload className="text-indigo-600 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold">Export Report</span>
                    </button>

                    {/* Premium Dropdown Menu */}
                    {showExportMenu && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          Dashboard Stats
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <button
                            onClick={() => handleExportDashboard("csv")}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors"
                          >
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                              <LuFileText />
                            </div>
                            Export CSV
                          </button>
                          <button
                            onClick={() => handleExportDashboard("excel")}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-emerald-50 rounded-2xl transition-colors"
                          >
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                              <LuFileSpreadsheet />
                            </div>
                            Export Excel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setIsOpenAddProductPanel({
                        open: true,
                        model: "Add Product",
                      })
                    }
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 text-sm font-black shadow-md"
                  >
                    <FiPlus strokeWidth={3} />
                    <span className="hidden xs:inline uppercase tracking-wider text-[11px]">
                      Add Product
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modern Animated Tabs */}
            <div className="px-4 sm:px-6 lg:px-8 border-t border-gray-50 bg-gray-50/30">
              <nav className="flex  items-center gap-2 overflow-x-auto no-scrollbar py-2">
                {[
                  { id: "overview", label: "Overview", icon: <FiActivity /> },
                  { id: "products", label: "Products", icon: <FiPackage /> },
                  { id: "orders", label: "Orders", icon: <FiShoppingBag /> },
                  {
                    id: "analytics",
                    label: "Analytics",
                    icon: <FiBarChart2 />,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6  py-2.5 rounded-lg pr-10 text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                      ? "bg-gray-900  text-white shadow-sm border border-gray-100 scale-105"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                      }`}
                  >
                    <span
                      className={
                        activeTab === tab.id ? "text-white" : "text-gray-400"
                      }
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4   py-4 md:py-4">
          {/* Onboarding Status Banner */}
         
{onboardingStatus.showBanner && (
            <div className={`mb-6 rounded-2xl p-4 shadow-lg ${!onboardingStatus.onboardingCompleted
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                : onboardingStatus.status === 'UnderReview'
                  ? 'bg-gradient-to-r from-green-500 to-green-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-xl">
                      {!onboardingStatus.onboardingCompleted ? '🚀' :
                        onboardingStatus.status === 'UnderReview' ? '⏳' : '📋'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {!onboardingStatus.onboardingCompleted
                        ? 'Complete Your Profile'
                        : onboardingStatus.status === 'UnderReview'
                          ? 'Profile Under Review'
                          : 'Pending Verification'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {!onboardingStatus.onboardingCompleted
                        ? `You're ${onboardingStatus.completionPercentage}% done. Complete your profile to start selling!`
                        : onboardingStatus.status === 'UnderReview'
                          ? 'We are reviewing your documents. This usually takes 1-2 business days.'
                          : 'Your profile is pending review. Please complete any missing documents.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Progress Bar - Only show when onboarding not complete */}
                  {!onboardingStatus.onboardingCompleted && (
                    <div className="hidden md:flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${onboardingStatus.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold text-sm">
                        {onboardingStatus.completionPercentage}%
                      </span>
                    </div>
                  )}

                  {/* Continue Setup Button */}
                  {!onboardingStatus.onboardingCompleted && (
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="px-6 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-md"
                    >
                      Continue Setup →
                    </button>
                  )}

                  {/* Under Review Badge */}
                  {onboardingStatus.onboardingCompleted && onboardingStatus.status === 'UnderReview' && (
                    <div className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                      <span className="text-white font-semibold text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-yellow-300 rounded-full animate-pulse"></span>
                        Under Review
                      </span>
                    </div>
                  )}

                  {/* Pending Badge */}
                  {onboardingStatus.onboardingCompleted && onboardingStatus.status === 'Pending' && (
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-md"
                    >
                      Update Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Stats Grid - Premium Multi-color Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {[
              {
                label: "Total Revenue",
                value: formatINR(stats?.overall?.total || 0),
                icon: <FaRupeeSign />,
                color: "indigo",
                gradient: "from-indigo-500 to-blue-600",
                shadow: "shadow-indigo-200",
              },
              {
                label: "Total Orders",
                value: stats?.overall?.count || 0,
                icon: <FiShoppingBag />,
                color: "emerald",
                gradient: "from-emerald-400 to-teal-600",
                shadow: "shadow-emerald-200",
              },
              {
                label: "Products",
                value: productStats.total,
                icon: <FiPackage />,
                color: "amber",
                gradient: "from-amber-400 to-orange-500",
                shadow: "shadow-amber-200",
              },
              {
                label: "Customers",
                value: new Set(orders.map((o) => o.user)).size || 0,
                icon: <FiUsers />,
                color: "rose",
                gradient: "from-rose-400 to-pink-600",
                shadow: "shadow-rose-200",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
              >
                {/* Background Subtle Pattern */}
                <div
                  className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-[0.05] rounded-full`}
                ></div>

                <div className="flex items-center gap-5 relative z-10">
                  {/* Icon Box */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white text-2xl shadow-md ${stat.shadow}`}
                  >
                    {stat.icon}
                  </div>

                  <div className="flex-1">
                    <dl>
                      <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">
                        {stat.label}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 tracking-tight">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>

                {/* Subtle Accent Line */}
                <div className="mt-5 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full w-3/4`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <>
              {/* Charts and Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow">
                  {/* Premium Modern Sales Overview Header */}
                  <div className="px-8 py-6 border-b border-slate-50 bg-gradient-to-r from-white via-indigo-50/10 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Side: Title & Status Indicator */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                          <FiActivity className="text-white text-xl" />
                        </div>
                        {/* Live Pulsing Dot */}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse shadow-sm"></span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          Sales Overview
                        </h3>
                        <div className="flex flex-col items-start gap-1 md:mt-1">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                            Store performance metrics
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - removed hardcoded content */}
                    <div className="flex items-center gap-2">
                    </div>
                  </div>
                  <div className="md:!p-6 p-2">
                    {/* Summary Stats */}
                    <div className="mb-8 flex flex-col md:flex-row gap-2 items-stretch">
                      {/* Revenue Chart */}
                      <div className="lg:col-span-2 h-[360px] w-[100%] md:w-[50%]">
                        <RevenueAreaChart data={orderSummaryChartData} />
                      </div>

                      {/* Orders Chart */}
                      <div className="lg:col-span-1 h-[360px] w-[100%] md:w-[50%]">
                        <OrdersBarChart data={orderSummaryChartData} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                      {/* Today */}
                      <div className="relative overflow-hidden rounded-2xl p-5 
                  bg-gradient-to-br from-indigo-500 to-indigo-600 
                  text-white shadow-md">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />

                        <p className="text-sm font-medium text-indigo-100">
                          Today’s Revenue
                        </p>

                        <p className="text-2xl font-extrabold mt-2">
                          {formatINR(stats?.today?.total || 0)}
                        </p>

                        <p className="text-xs text-indigo-200 mt-1">
                          {stats?.today?.count || 0} orders
                        </p>
                      </div>

                      {/* Month */}
                      <div className="relative overflow-hidden rounded-2xl p-5 
                  bg-gradient-to-br from-emerald-500 to-emerald-600 
                  text-white shadow-md">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />

                        <p className="text-sm font-medium text-emerald-100">
                          This Month
                        </p>

                        <p className="text-2xl font-extrabold mt-2">
                          {formatINR(stats?.month?.total || 0)}
                        </p>

                        <p className="text-xs text-emerald-200 mt-1">
                          {stats?.month?.count || 0} orders
                        </p>
                      </div>

                      {/* Year */}
                      <div className="relative overflow-hidden rounded-2xl p-5 
                  bg-gradient-to-br from-amber-500 to-amber-600 
                  text-white shadow-md">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />

                        <p className="text-sm font-medium text-amber-100">
                          This Year
                        </p>

                        <p className="text-2xl font-extrabold mt-2">
                          {formatINR(stats?.year?.total || 0)}
                        </p>

                        <p className="text-xs text-amber-200 mt-1">
                          {stats?.year?.count || 0} orders
                        </p>
                      </div>

                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                      {/* Modern Order Status Distribution Chart */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order Status Distribution
                          </h3>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Total: {orders.length}
                          </span>
                        </div>

                        <div className="flex-1 min-h-[300px] w-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={1200}
                              >
                                {statusData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="none"
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                                }}
                                itemStyle={{
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => (
                                  <span className="text-xs font-medium text-gray-600 ml-1">
                                    {value}
                                  </span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>

                          {/* Center Text for Donut */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <p className="text-3xl font-bold text-gray-900">
                              {orders.length}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                              Total Orders
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions & Insights */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                      Quick Actions
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage products, orders & performance
                    </p>
                  </div>

                  {/* Actions */}
          <div className="p-6 space-y-3">
                    <button
                      onClick={() =>
                        setIsOpenAddProductPanel({
                          open: true,
                          model: "Add Product",
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                 bg-red-500 text-white rounded-xl hover:bg-red-600 
                 transition-all font-semibold text-sm shadow-sm"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add New Product
                    </button>

                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                 bg-yellow-500 text-white rounded-xl hover:bg-yellow-400 
                 transition-all font-semibold text-sm shadow-sm"
                    >
                      View All Orders
                    </button>

                    <button
                      onClick={() => navigate("/products")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                 bg-blue-500 text-white rounded-xl hover:bg-blue-600 
                 transition-all font-semibold text-sm shadow-sm"
                    >
                      Manage Products
                    </button>
                  </div>



                  {/* Divider */}
                  <div className="h-px bg-gray-100 mx-6" />

                  {/* Quick Insights */}
                  <div className="p-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                      Quick Insights
                    </h4>

                    <div className="space-y-4">
                      {/* Performance */}
                      <div
                        className="flex items-center justify-between p-4 
                      bg-emerald-50/60 rounded-2xl 
                      border border-emerald-100/60 
                      hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                            <FiTrendingUp className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              Performance
                            </p>
                            <p className="text-xs text-emerald-700 font-medium">
                              Monthly revenue:{" "}
                              {formatINR(stats?.month?.total || 0)}
                            </p>
                          </div>
                        </div>
                        <FiArrowRight className="text-emerald-300" />
                      </div>

                      {/* Inventory */}
                      <div
                        className="flex items-center justify-between p-4 
                      bg-amber-50/60 rounded-2xl 
                      border border-amber-100/60 
                      hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-amber-600">
                            <FiPackage className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              Inventory Alert
                            </p>
                            <p className="text-xs text-amber-700 font-medium">
                              {productStats.outOfStock + productStats.lowStock}{" "}
                              items need attention
                            </p>
                          </div>
                        </div>
                        <FiArrowRight className="text-amber-300" />
                      </div>

                      {/* Pipeline */}
                      <div
                        className="flex items-center justify-between p-4 
                      bg-indigo-50/60 rounded-2xl 
                      border border-indigo-100/60 
                      hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                            <FiShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              Order Pipeline
                            </p>
                            <p className="text-xs text-indigo-700 font-medium">
                              {orderStatusStats.pending +
                                orderStatusStats.processing}{" "}
                              orders to process
                            </p>
                          </div>
                        </div>
                        <FiArrowRight className="text-indigo-300" />
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => navigate("/analytics")}
                      className="w-full mt-8 py-3 bg-gray-900 text-white rounded-xl 
                 hover:bg-indigo-600 transition-all 
                 font-bold text-sm shadow-lg"
                    >
                      View Detailed Analytics
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => navigate("/orders")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    View All <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* ================= DESKTOP TABLE ================= */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Order ID", "Customer", "Date", "Amount", "Status"].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50 bg-white">
                      {recentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            #{order._id?.slice(-8).toUpperCase()}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.shippingAddress?.name || "—"}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {order.placedAt
                              ? new Date(order.placedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                              : "—"}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatINR(order.totalAmount)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              {order.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ================= MOBILE CARDS ================= */}
                <div className="md:hidden divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-indigo-600">
                            #{order._id?.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.shippingAddress?.name || "—"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.placedAt
                              ? new Date(order.placedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                              : "—"}
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <p className="text-sm font-bold text-gray-900">
                          {formatINR(order.totalAmount)}
                        </p>

                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="text-xs font-semibold text-indigo-600"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

          {activeTab === "products" && (
            <>
              {/* Product Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-500">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.active}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.outOfStock}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-500">Low Stock (≤5)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.lowStock}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.total}
                  </p>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    All Products
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    <button
                      onClick={() =>
                        setIsOpenAddProductPanel({
                          open: true,
                          model: "Add Product",
                        })
                      }
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm md:text-base"
                    >
                      <FiPlus />{" "}
                      <span className="hidden sm:inline">Add Product</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productsLoading ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Loading products...
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No products found
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.slice(0, 10).map((product) => (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={
                                    product.images?.[0]?.url ||
                                    "/placeholder.png"
                                  }
                                  alt=""
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                    {product.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.brand || "—"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatINR(product.price)}
                              </div>
                              {product.oldprice && (
                                <div className="text-xs text-gray-400 line-through">
                                  {formatINR(product.oldprice)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`text-sm font-medium ${product.stock === 0
                                  ? "text-red-600"
                                  : product.stock <= 5
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                  }`}
                              >
                                {product.stock} units
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${product.stock === 0
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                                  }`}
                              >
                                {product.stock === 0
                                  ? "Out of Stock"
                                  : "Active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleViewProduct(product)}
                                className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors mr-1"
                                title="View Product"
                              >
                                <FiEye />
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                                title="Edit Product"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(product)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Product"
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Showing {Math.min(10, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
                  </p>
                  <button
                    onClick={() => navigate("/products")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View All Products →
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <>
              {/* Order Status Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 cursor-pointer hover:shadow-md"
                  onClick={() => navigate("/orders/pending")}
                >
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStatusStats.pending}
                  </p>
                </div>
                <div
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow-md"
                  onClick={() => navigate("/orders/processing")}
                >
                  <p className="text-sm text-gray-500">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStatusStats.processing}
                  </p>
                </div>
                <div
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 cursor-pointer hover:shadow-md"
                  onClick={() => navigate("/orders/shipped")}
                >
                  <p className="text-sm text-gray-500">Shipped</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStatusStats.shipped}
                  </p>
                </div>
                <div
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-md"
                  onClick={() => navigate("/orders/delivered")}
                >
                  <p className="text-sm text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStatusStats.delivered}
                  </p>
                </div>
                <div
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500 cursor-pointer hover:shadow-md"
                  onClick={() => navigate("/orders/cancelled")}
                >
                  <p className="text-sm text-gray-500">Cancelled/Returned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderStatusStats.cancelled}
                  </p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    All Orders
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-9 pr-3 py-1.5 md:pl-10 md:pr-4 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-36 sm:w-auto"
                      />
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                    <button className="p-1.5 md:p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <FiFilter className="text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            Loading orders...
                          </td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.slice(0, 10).map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order._id?.slice(-8).toUpperCase()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.shippingAddress?.name || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.placedAt
                                ? new Date(order.placedAt).toLocaleDateString(
                                  "en-IN",
                                  { day: "numeric", month: "short" }
                                )
                                : "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.items?.length || 0} items
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatINR(order.totalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}{" "}
                                {order.status || "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Order Details"
                              >
                                <FiEye />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Showing {Math.min(10, filteredOrders.length)} of{" "}
                    {filteredOrders.length} orders
                  </p>
                  <button
                    onClick={() => navigate("/orders")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View All Orders →
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "analytics" && (
            <>
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Revenue Trend
                    </h3>
                    <FiTrendingUp className="text-green-500 w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatINR(stats?.overall?.total || 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total revenue all time
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">This Month</span>
                      <span className="font-medium text-gray-900">
                        {formatINR(stats?.month?.total || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Today</span>
                      <span className="font-medium text-gray-900">
                        {formatINR(stats?.today?.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Order Analytics
                    </h3>
                    <FiBarChart2 className="text-indigo-500 w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.overall?.count || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total orders received
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg. Order Value</span>
                      <span className="font-medium text-gray-900">
                        {formatINR(
                          stats?.overall?.count
                            ? stats?.overall?.total / stats?.overall?.count
                            : 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Completion Rate</span>
                      <span className="font-medium text-green-600">
                        {orders.length
                          ? Math.round(
                            (orderStatusStats.delivered / orders.length) * 100
                          )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Product Performance
                    </h3>
                    <FiPieChart className="text-yellow-500 w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {productStats.total}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Products in catalog
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">In Stock</span>
                      <span className="font-medium text-green-600">
                        {productStats.active}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Need Restock</span>
                      <span className="font-medium text-red-600">
                        {productStats.outOfStock + productStats.lowStock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Order Status Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: "Pending",
                        count: orderStatusStats.pending,
                        color: "bg-yellow-500",
                      },
                      {
                        label: "Processing",
                        count: orderStatusStats.processing,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Shipped",
                        count: orderStatusStats.shipped,
                        color: "bg-purple-500",
                      },
                      {
                        label: "Delivered",
                        count: orderStatusStats.delivered,
                        color: "bg-green-500",
                      },
                      {
                        label: "Cancelled/Returned",
                        count: orderStatusStats.cancelled,
                        color: "bg-red-500",
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{
                              width: `${orders.length
                                ? (item.count / orders.length) * 100
                                : 0
                                }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Quick Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FiTrendingUp className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Best Performing
                          </p>
                          <p className="text-sm text-gray-500">
                            This month's revenue is{" "}
                            {formatINR(stats?.month?.total || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <FiPackage className="text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Inventory Alert
                          </p>
                          <p className="text-sm text-gray-500">
                            {productStats.outOfStock + productStats.lowStock}{" "}
                            products need attention
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FiShoppingBag className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Pending Orders
                          </p>
                          <p className="text-sm text-gray-500">
                            {orderStatusStats.pending +
                              orderStatusStats.processing}{" "}
                            orders need processing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/analytics")}
                    className="w-full mt-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
                  >
                    View Detailed Analytics
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setSelectedOrder(null)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{selectedOrder._id?.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on{" "}
                    {selectedOrder.placedAt
                      ? new Date(selectedOrder.placedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                      : "—"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Customer Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {selectedOrder.shippingAddress?.name || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {selectedOrder.shippingAddress?.phone || "—"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {selectedOrder.shippingAddress?.address},{" "}
                      {selectedOrder.shippingAddress?.pin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Order Status
                  </h4>
                  <p className="text-xs text-gray-500">
                    Update the status of this order
                  </p>
                </div>
                <select
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer ${getStatusBadge(
                    selectedOrder.status
                  )}`}
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder._id, e.target.value)
                  }
                  disabled={updatingStatus}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Order Items */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">
                    Order Items ({selectedOrder.items?.length || 0})
                  </h4>
                </div>
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                        {item.productId?.images?.[0]?.url ? (
                          <img
                            src={item.productId.images[0].url}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <LuPackage className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.productId?.title || "Unknown Product"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatINR(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-lg font-medium text-gray-900">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  {formatINR(selectedOrder.totalAmount)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/orders")}
                  className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setSelectedProduct(null)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    {selectedProduct.images?.[0]?.url ? (
                      <img
                        src={selectedProduct.images[0].url}
                        className="w-full h-full object-cover"
                        alt={selectedProduct.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LuPackage className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedProduct.brand || "No brand"}
                    </p>
                    <span
                      className={`inline-flex items-center mt-1 px-2 py-0.5 text-xs rounded-full ${selectedProduct.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                        }`}
                    >
                      {selectedProduct.stock === 0
                        ? "Out of Stock"
                        : `${selectedProduct.stock} in stock`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                {/* Pricing */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Pricing
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Selling Price:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatINR(selectedProduct.price)}
                      </span>
                    </div>
                    {selectedProduct.oldprice && (
                      <div>
                        <span className="text-gray-500">MRP:</span>
                        <span className="font-medium text-gray-400 line-through ml-2">
                          {formatINR(selectedProduct.oldprice)}
                        </span>
                      </div>
                    )}
                    {selectedProduct.oldprice && (
                      <div>
                        <span className="text-gray-500">Discount:</span>
                        <span className="font-medium text-green-600 ml-2">
                          {Math.round(
                            ((selectedProduct.oldprice -
                              selectedProduct.price) /
                              selectedProduct.oldprice) *
                            100
                          )}
                          % off
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Product Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {selectedProduct.category || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sub-Category:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {selectedProduct.subcat || "—"}
                      </span>
                    </div>
                    {selectedProduct.weight && (
                      <div>
                        <span className="text-gray-500">Weight:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          {selectedProduct.weight}
                        </span>
                      </div>
                    )}
                    {selectedProduct.rating > 0 && (
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <span className="font-medium text-gray-900 ml-2">
                          ⭐ {selectedProduct.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    handleEditProduct(selectedProduct);
                  }}
                  className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiEdit className="w-4 h-4" /> Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setDeleteConfirm(null)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Product
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.title}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingProduct}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm._id)}
                  disabled={deletingProduct}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deletingProduct ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashBoard;
