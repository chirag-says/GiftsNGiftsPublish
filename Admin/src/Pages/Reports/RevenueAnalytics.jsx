import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { downloadCSV } from "../../utils/exportUtils";
import { Admincontext } from "../../Components/context/admincontext";
import { Button, Card, CardContent, LinearProgress, Alert, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { MdTrendingUp, MdShoppingCart, MdAttachMoney, MdShowChart } from "react-icons/md";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

function RevenueAnalytics() {
    const { } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange.start) params.append('startDate', dateRange.start);
            if (dateRange.end) params.append('endDate', dateRange.end);

            const { data: res } = await api.get(
                `/api/admin/reports/revenue?${params.toString()}`
            );
            if (res.success) {
                setData(res.data || []);
                setSummary(res.summary || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
            }
        } catch (e) {
            console.error("Error fetching revenue data:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><MdTrendingUp size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Revenue Analytics</h2>
                        <p className="text-sm text-gray-500">Track your sales and revenue performance.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <TextField type="date" label="Start Date" size="small" InputLabelProps={{ shrink: true }} value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                    <TextField type="date" label="End Date" size="small" InputLabelProps={{ shrink: true }} value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                    <Button startIcon={<FiRefreshCw />} onClick={fetchData} disabled={loading}>Refresh</Button>
                    <Button variant="outlined" startIcon={<FiDownload />} onClick={() => downloadCSV(data, 'revenue_analytics')}>Export</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.totalRevenue)}</h3>
                            <p className="text-gray-500 text-sm mt-1">All time earnings</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center">
                            <MdAttachMoney className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">Total Orders</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{summary.totalOrders}</h3>
                            <p className="text-gray-500 text-sm mt-1">Completed orders</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center">
                            <MdShoppingCart className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Average Order Value</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(summary.averageOrderValue)}</h3>
                            <p className="text-gray-500 text-sm mt-1">Per order</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center">
                            <MdShowChart className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-600 text-sm font-semibold uppercase tracking-wide">Avg Daily Revenue</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(data.length > 0 ? summary.totalRevenue / data.length : 0)}</h3>
                            <p className="text-gray-500 text-sm mt-1">Based on {data.length} days</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center">
                            <MdTrendingUp className="text-white text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <Card className="mb-6">
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data.slice().reverse()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <MdShowChart size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>No revenue data available</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">Orders Trend</h3>
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.slice().reverse()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="totalOrders" stroke="#10B981" name="Orders" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="averageOrderValue" stroke="#F59E0B" name="Avg Order Value" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>No order data available</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default RevenueAnalytics;
