import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, LinearProgress, Avatar, Chip } from "@mui/material";
import { MdInventory, MdVisibility, MdShoppingCart, MdTrendingUp, MdCategory, MdStar } from "react-icons/md";
import { FiRefreshCw, FiDownload, FiPackage, FiPercent } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

function ProductAnalytics() {
    const { } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/reports/product-analytics');
            if (data.success) setProducts(data.products || []);
        } catch (e) {
            console.error("Error fetching product analytics:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    };

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

    const topByRevenue = [...products]
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 8)
        .map((p, i) => ({
            name: p.name?.substring(0, 18) + (p.name?.length > 18 ? '...' : '') || `Product ${i + 1}`,
            revenue: p.revenue || 0,
            fill: COLORS[i % COLORS.length]
        }));

    const topByViews = [...products]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 8)
        .map((p, i) => ({
            name: p.name?.substring(0, 12) + (p.name?.length > 12 ? '...' : '') || `Product ${i + 1}`,
            views: p.views || 0
        }));

    // Summary stats
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalPurchases = products.reduce((sum, p) => sum + (p.purchases || 0), 0);
    const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const avgConversion = products.length > 0
        ? products.reduce((sum, p) => sum + parseFloat(p.conversionRate || 0), 0) / products.length
        : 0;

    const StatCard = ({ icon: Icon, title, value, subtext, bgColor, iconColor, textColor }) => (
        <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border ${bgColor}`}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -mt-8 -mr-8" style={{ background: iconColor }}></div>
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className={`text-sm font-semibold uppercase tracking-wide ${textColor}`}>{title}</p>
                    <h3 className="text-3xl font-bold mt-2 text-gray-900">{value}</h3>
                    {subtext && <p className="text-sm mt-2 text-gray-500">{subtext}</p>}
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: iconColor }}>
                    <Icon className="text-2xl text-white" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <MdInventory className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
                            <p className="text-gray-500 text-sm">Track product performance, views & conversions</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-200 transition">
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 4, mx: 'auto', maxWidth: '1280px', borderRadius: 1 }} />}

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={MdVisibility}
                        title="Total Views"
                        value={totalViews.toLocaleString()}
                        subtext="Across all products"
                        bgColor="bg-white border-blue-200"
                        iconColor="#3b82f6"
                        textColor="text-blue-600"
                    />
                    <StatCard
                        icon={FiPackage}
                        title="Total Purchases"
                        value={totalPurchases.toLocaleString()}
                        subtext="Items sold"
                        bgColor="bg-white border-emerald-200"
                        iconColor="#10b981"
                        textColor="text-emerald-600"
                    />
                    <StatCard
                        icon={MdTrendingUp}
                        title="Product Revenue"
                        value={formatCurrency(totalRevenue)}
                        subtext="Total earnings"
                        bgColor="bg-white border-purple-200"
                        iconColor="#8b5cf6"
                        textColor="text-purple-600"
                    />
                    <StatCard
                        icon={FiPercent}
                        title="Avg Conversion"
                        value={`${avgConversion.toFixed(2)}%`}
                        subtext="View to purchase rate"
                        bgColor="bg-white border-orange-200"
                        iconColor="#f97316"
                        textColor="text-orange-600"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <MdTrendingUp className="text-indigo-600" />
                                </span>
                                Top Products by Revenue
                            </h3>
                        </div>
                        {topByRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={topByRevenue} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} stroke="#9ca3af" fontSize={12} />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={20}>
                                        {topByRevenue.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <MdInventory className="text-5xl mx-auto mb-3 text-gray-300" />
                                    <p>No revenue data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Views Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                                    <MdVisibility className="text-cyan-600" />
                                </span>
                                Top Products by Views
                            </h3>
                        </div>
                        {topByViews.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={topByViews}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={90}
                                        dataKey="views"
                                        nameKey="name"
                                        paddingAngle={2}
                                    >
                                        {topByViews.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                                    <Legend
                                        layout="vertical"
                                        align="right"
                                        verticalAlign="middle"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <MdVisibility className="text-5xl mx-auto mb-3 text-gray-300" />
                                    <p>No view data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FiPackage className="text-purple-600" />
                            </span>
                            All Products Performance
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">{products.length} products tracked</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Product</th>
                                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Price</th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">Stock</th>
                                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Views</th>
                                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Purchases</th>
                                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">Conversion</th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.slice(0, 15).map((product, idx) => (
                                    <tr key={product._id || idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {product.image ? (
                                                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <MdInventory className="text-xl" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name || 'Unknown Product'}</p>
                                                    <p className="text-xs text-gray-500">{product.category || 'Uncategorized'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right py-4 px-4 font-medium text-gray-900">{formatCurrency(product.price || 0)}</td>
                                        <td className="text-center py-4 px-4">
                                            <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-emerald-100 text-emerald-700' :
                                                product.stock > 0 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {product.stock || 0}
                                            </span>
                                        </td>
                                        <td className="text-right py-4 px-4 text-gray-600">{(product.views || 0).toLocaleString()}</td>
                                        <td className="text-right py-4 px-4 text-gray-600">{product.purchases || 0}</td>
                                        <td className="text-right py-4 px-4 font-semibold text-emerald-600">{formatCurrency(product.revenue || 0)}</td>
                                        <td className="text-center py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${parseFloat(product.conversionRate) > 5 ? 'bg-emerald-100 text-emerald-700' :
                                                parseFloat(product.conversionRate) > 2 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {product.conversionRate || 0}%
                                            </span>
                                        </td>
                                        <td className="text-center py-4 px-4">
                                            {product.isFeatured ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                                    <MdStar className="text-sm" /> Featured
                                                </span>
                                            ) : product.isApproved ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <MdInventory className="text-5xl text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">No product analytics available</p>
                                            <p className="text-gray-400 text-sm mt-1">Products will appear here once data is collected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {products.length > 15 && (
                        <div className="p-4 border-t border-gray-100 text-center">
                            <button className="text-indigo-600 font-medium text-sm hover:text-indigo-700">
                                View all {products.length} products →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductAnalytics;
