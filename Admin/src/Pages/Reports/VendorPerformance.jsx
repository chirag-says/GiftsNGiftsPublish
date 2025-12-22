import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { downloadCSV } from "../../utils/exportUtils";
import { Admincontext } from "../../Components/context/admincontext";
import {
    Button, Card, CardContent, LinearProgress, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Avatar, Chip, TextField,
    ToggleButton, ToggleButtonGroup, Autocomplete
} from "@mui/material";
import { MdStorefront, MdTrendingUp, MdCalendarToday, MdSearch } from "react-icons/md";
import { FiRefreshCw, FiDownload, FiPackage, FiShoppingCart, FiDollarSign } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { toast } from "react-toastify";

function VendorPerformance() {
    const { } = useContext(Admincontext);
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState([]);

    // New state for seller search and sales report
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [period, setPeriod] = useState('month');
    const [customDateFrom, setCustomDateFrom] = useState('');
    const [customDateTo, setCustomDateTo] = useState('');
    const [sellerReport, setSellerReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    // Fetch all vendors for dropdown
    const fetchVendors = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/reports/vendor-performance');
            if (data.success) setVendors(data.vendors || []);
        } catch (e) {
            console.error("Error fetching vendors:", e);
        } finally {
            setLoading(false);
        }
    };

    // Fetch individual seller sales report
    const fetchSellerReport = async () => {
        if (!selectedSeller) {
            toast.warning("Please select a seller first");
            return;
        }

        setReportLoading(true);
        try {
            const params = {
                sellerId: selectedSeller._id,
                period: period
            };

            if (period === 'custom') {
                if (!customDateFrom || !customDateTo) {
                    toast.warning("Please select both start and end dates");
                    setReportLoading(false);
                    return;
                }
                params.startDate = customDateFrom;
                params.endDate = customDateTo;
            }

            const { data } = await api.get('/api/admin/reports/seller-sales', {
                params
            });

            if (data.success) {
                setSellerReport(data);
                toast.success("Report loaded successfully!");
            }
        } catch (e) {
            console.error("Error fetching seller report:", e);
            toast.error("Failed to load report");
        } finally {
            setReportLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
    };

    const getPeriodLabel = () => {
        switch (period) {
            case 'today': return "Today's";
            case 'week': return "This Week's";
            case 'month': return "This Month's";
            case 'custom': return "Custom Period";
            default: return "All Time";
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><MdStorefront size={28} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Vendor Performance</h2>
                        <p className="text-sm text-gray-500">Search sellers and analyze their sales by date range.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button startIcon={<FiRefreshCw />} onClick={fetchVendors} disabled={loading}>Refresh</Button>
                    <Button variant="outlined" startIcon={<FiDownload />} onClick={() => downloadCSV(vendors, 'vendor_performance')}>Export</Button>
                </div>
            </div>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* ========== SELLER SEARCH & FILTER SECTION ========== */}
            <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100">
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <MdSearch className="text-indigo-600" size={24} />
                        <h3 className="text-lg font-bold text-indigo-800">Seller Sales Report</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Seller Search Dropdown */}
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Seller</label>
                            <Autocomplete
                                options={vendors}
                                getOptionLabel={(option) => `${option.name} (${option.email})`}
                                value={selectedSeller}
                                onChange={(e, newValue) => setSelectedSeller(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Type to search seller..."
                                        size="small"
                                        sx={{ backgroundColor: 'white' }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option._id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                                                {option.name?.[0]}
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{option.name}</p>
                                                <p className="text-xs text-gray-500">{option.email}</p>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            />
                        </div>

                        {/* Period Toggle */}
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                            <ToggleButtonGroup
                                value={period}
                                exclusive
                                onChange={(e, newPeriod) => newPeriod && setPeriod(newPeriod)}
                                size="small"
                                sx={{ backgroundColor: 'white' }}
                            >
                                <ToggleButton value="today" sx={{ px: 2 }}>Today</ToggleButton>
                                <ToggleButton value="week" sx={{ px: 2 }}>Week</ToggleButton>
                                <ToggleButton value="month" sx={{ px: 2 }}>Month</ToggleButton>
                                <ToggleButton value="custom" sx={{ px: 2 }}>Custom</ToggleButton>
                            </ToggleButtonGroup>
                        </div>

                        {/* Custom Date Range */}
                        {period === 'custom' && (
                            <div className="lg:col-span-1 flex gap-2">
                                <TextField
                                    type="date"
                                    label="From"
                                    size="small"
                                    value={customDateFrom}
                                    onChange={(e) => setCustomDateFrom(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ backgroundColor: 'white', flex: 1 }}
                                />
                                <TextField
                                    type="date"
                                    label="To"
                                    size="small"
                                    value={customDateTo}
                                    onChange={(e) => setCustomDateTo(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ backgroundColor: 'white', flex: 1 }}
                                />
                            </div>
                        )}

                        {/* Search Button */}
                        <div>
                            <Button
                                variant="contained"
                                onClick={fetchSellerReport}
                                disabled={reportLoading || !selectedSeller}
                                startIcon={<MdSearch />}
                                sx={{
                                    backgroundColor: '#4F46E5',
                                    '&:hover': { backgroundColor: '#4338CA' },
                                    height: 40
                                }}
                            >
                                {reportLoading ? 'Loading...' : 'Get Report'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ========== SELLER REPORT RESULTS ========== */}
            {sellerReport && (
                <div className="space-y-6 mb-8">
                    {/* Seller Info Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={sellerReport.seller?.image}
                                sx={{ width: 64, height: 64, border: '3px solid white' }}
                            >
                                {sellerReport.seller?.name?.[0]}
                            </Avatar>
                            <div>
                                <h3 className="text-2xl font-bold">{sellerReport.seller?.name}</h3>
                                <p className="text-indigo-200">{sellerReport.seller?.email}</p>
                                {sellerReport.seller?.uniqueId && (
                                    <Chip
                                        label={`ID: ${sellerReport.seller.uniqueId}`}
                                        size="small"
                                        sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                )}
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-sm text-indigo-200">{getPeriodLabel()} Sales</p>
                                <p className="text-3xl font-bold">{formatCurrency(sellerReport.summary?.totalRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                    <FiDollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Revenue</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {formatCurrency(sellerReport.summary?.totalRevenue)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <FiShoppingCart size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Orders</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {sellerReport.summary?.totalOrders || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <FiPackage size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Items Sold</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {sellerReport.summary?.totalItems || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="flex items-center gap-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                    <MdTrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Avg Order Value</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {formatCurrency(sellerReport.summary?.avgOrderValue)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Sales Chart */}
                    {sellerReport.dailySales?.length > 0 && (
                        <Card>
                            <CardContent>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <MdCalendarToday className="text-indigo-600" />
                                    Daily Sales Breakdown
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={sellerReport.dailySales}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11 }}
                                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        />
                                        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip
                                            formatter={(value) => [formatCurrency(value), 'Revenue']}
                                            labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#4F46E5"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Top Products Table */}
                    {sellerReport.topProducts?.length > 0 && (
                        <Card>
                            <CardContent>
                                <h3 className="text-lg font-bold mb-4">Top Selling Products</h3>
                                <TableContainer component={Paper} className="rounded-xl">
                                    <Table size="small">
                                        <TableHead className="bg-gray-50">
                                            <TableRow>
                                                <TableCell><strong>Product</strong></TableCell>
                                                <TableCell align="right"><strong>Qty Sold</strong></TableCell>
                                                <TableCell align="right"><strong>Revenue</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sellerReport.topProducts.map((product, idx) => (
                                                <TableRow key={product.productId} hover>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar
                                                                src={product.image}
                                                                variant="rounded"
                                                                sx={{ width: 40, height: 40 }}
                                                            >
                                                                {product.title?.[0]}
                                                            </Avatar>
                                                            <span className="font-medium truncate max-w-[200px]">
                                                                {product.title}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip label={product.quantity} size="small" color="primary" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell align="right" className="font-bold text-green-600">
                                                        {formatCurrency(product.revenue)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* No Data State */}
                    {sellerReport.summary?.totalOrders === 0 && (
                        <Card>
                            <CardContent className="text-center py-12">
                                <FiShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">No sales data found for {getPeriodLabel().toLowerCase()}</p>
                                <p className="text-sm text-gray-400 mt-1">Try selecting a different time period</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* ========== ALL VENDORS OVERVIEW ========== */}
            <Card>
                <CardContent>
                    <h3 className="text-lg font-bold mb-4">All Vendors Overview</h3>
                    <TableContainer component={Paper} className="rounded-xl">
                        <Table>
                            <TableHead className="bg-gray-50">
                                <TableRow>
                                    <TableCell><strong>Vendor</strong></TableCell>
                                    <TableCell align="right"><strong>Products</strong></TableCell>
                                    <TableCell align="right"><strong>Orders</strong></TableCell>
                                    <TableCell align="right"><strong>Total Revenue</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vendors.map((vendor, idx) => (
                                    <TableRow
                                        key={vendor._id || idx}
                                        hover
                                        onClick={() => setSelectedSeller(vendor)}
                                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f0f9ff' } }}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar sx={{ bgcolor: `hsl(${idx * 40}, 70%, 50%)` }}>
                                                    {vendor.name?.[0] || 'V'}
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{vendor.name || 'Unknown Vendor'}</p>
                                                    <p className="text-xs text-gray-500">{vendor.email || '-'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">{vendor.totalProducts || 0}</TableCell>
                                        <TableCell align="right">{vendor.totalOrders || 0}</TableCell>
                                        <TableCell align="right" className="font-bold text-green-600">
                                            {formatCurrency(vendor.revenue || 0)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                size="small"
                                                label={vendor.approved ? 'Active' : 'Pending'}
                                                color={vendor.approved ? 'success' : 'warning'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {vendors.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <MdStorefront size={48} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No vendor data available</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </div>
    );
}

export default VendorPerformance;
