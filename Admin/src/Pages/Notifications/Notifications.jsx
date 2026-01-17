import React, { useState, useContext, useEffect } from "react";
import api from "../../utils/api";
import { Admincontext } from "../../Components/context/admincontext";
import { useLocation } from "react-router-dom";
import {
    Button, TextField, Tab, Tabs, Box, Chip, Card, CardContent, Switch, FormControlLabel,
    Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Badge, Tooltip, LinearProgress
} from "@mui/material";
import {
    MdNotifications, MdNotificationsActive, MdShoppingCart, MdSystemUpdate, MdStore,
    MdPerson, MdSettings, MdHistory, MdDelete, MdVisibility, MdCheck, MdClose,
    MdWarning, MdInfo, MdError, MdCheckCircle, MdRefresh, MdFilterList, MdClear
} from "react-icons/md";
import { FiPlus, FiRefreshCw, FiBell, FiAlertCircle, FiTruck, FiUsers } from "react-icons/fi";
import { IoTicketOutline } from "react-icons/io5";

function Notifications() {
    const { } = useContext(Admincontext);
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data State
    const [notifications, setNotifications] = useState([]);
    const [orderAlerts, setOrderAlerts] = useState([]);
    const [systemUpdates, setSystemUpdates] = useState([]);
    const [vendorRequests, setVendorRequests] = useState([]);
    const [customerComplaints, setCustomerComplaints] = useState([]);
    const [settings, setSettings] = useState({
        emailNotifications: { orderAlerts: true, vendorRequests: true, customerComplaints: true, systemUpdates: true, lowStock: true, dailyReport: false },
        pushNotifications: { orderAlerts: true, vendorRequests: true, customerComplaints: true, systemUpdates: false },
        smsNotifications: { urgentOrders: false, criticalAlerts: false },
        quietHours: { enabled: false, start: "22:00", end: "08:00" }
    });
    const [activityLogs, setActivityLogs] = useState([]);
    const [stats, setStats] = useState({
        unreadNotifications: 0,
        unreadOrderAlerts: 0,
        pendingVendorRequests: 0,
        newComplaints: 0,
        totalActivityToday: 0
    });

    // Form State
    const [newSystemUpdate, setNewSystemUpdate] = useState({ title: "", description: "", updateType: "announcement", version: "", scheduledAt: "" });
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        if (tabParam) setTabValue(parseInt(tabParam));
        fetchNotificationsData();
    }, [location.search]);

    const fetchNotificationsData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/admin/notifications');
            if (data.success) {
                setNotifications(data.notifications || []);
                setOrderAlerts(data.orderAlerts || []);
                setSystemUpdates(data.systemUpdates || []);
                setVendorRequests(data.vendorRequests || []);
                setCustomerComplaints(data.customerComplaints || []);
                setActivityLogs(data.activityLogs || []);
                if (data.settings && Object.keys(data.settings).length > 0) {
                    setSettings(data.settings);
                }
                if (data.stats) setStats(data.stats);
            }
        } catch (e) {
            console.error("Error fetching notifications data:", e);
        } finally {
            setLoading(false);
        }
    };

    //mark: Logic remains exactly as provided
    const createSystemUpdate = async () => {
        try {
            const { data } = await api.post('/api/admin/notifications/system-update', newSystemUpdate);
            if (data.success) {
                fetchNotificationsData();
                setNewSystemUpdate({ title: "", description: "", updateType: "announcement", version: "", scheduledAt: "" });
                setOpenDialog(false);
                alert("System Update Created Successfully!");
            }
        } catch (e) {
            console.error("Create System Update Error:", e);
            alert("Failed to create system update. Please try again.");
        }
    };

    const updateVendorRequestStatus = async (id, status) => {
        try {
            const { data } = await api.put(`/api/admin/notifications/vendor-request/${id}`, { status });
            if (data.success) fetchNotificationsData();
        } catch (e) {
            console.error("Update Vendor Request Error:", e);
            alert("Failed to update request status.");
        }
    };

    const updateComplaintStatus = async (id, status, resolution = "") => {
        try {
            const { data } = await api.put(`/api/admin/notifications/complaint/${id}`, { status, resolution });
            if (data.success) fetchNotificationsData();
        } catch (e) {
            console.error("Update Complaint Error:", e);
            alert("Failed to update complaint status.");
        }
    };

    const saveSettings = async () => {
        try {
            const { data } = await api.put('/api/admin/notifications/settings', settings);
            if (data.success) alert("Settings saved successfully!");
        } catch (e) {
            console.error("Save Settings Error:", e);
            alert("Failed to save settings.");
        }
    };

    const markOrderAlertRead = async (id) => {
        try {
            await api.put(`/api/admin/notifications/order-alert/${id}/read`);
            fetchNotificationsData();
        } catch (e) { console.error("Mark Read Error:", e); }
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;
        try {
            const { data } = await api.delete(`/api/admin/notifications/${type}/${id}`);
            if (data.success) {
                fetchNotificationsData();
                alert("Deleted successfully!");
            }
        } catch (e) { console.error("Delete Error:", e); alert("Failed to delete."); }
    };

    const clearActivityLogs = async () => {
        if (!window.confirm("Clear all activity logs older than 30 days?")) return;
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const { data } = await api.post('/api/admin/notifications/activity-logs/clear', { olderThan: thirtyDaysAgo });
            if (data.success) {
                fetchNotificationsData();
                alert("Old logs cleared!");
            }
        } catch (e) { console.error("Clear Logs Error:", e); alert("Failed to clear logs."); }
    };

    const getAlertTypeColor = (type) => {
        switch (type) {
            case "new_order": return "success";
            case "payment_received": return "success";
            case "payment_failed": return "error";
            case "order_cancelled": return "error";
            case "refund_requested": return "warning";
            case "delivery_delayed": return "warning";
            default: return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": case "new": return "warning";
            case "in_review": case "investigating": return "info";
            case "approved": case "resolved": case "completed": return "success";
            case "rejected": case "closed": case "cancelled": return "error";
            default: return "default";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent": return "error";
            case "high": return "error";
            case "medium": return "warning";
            case "low": return "success";
            default: return "default";
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case "created": return <FiPlus className="text-green-500" />;
            case "updated": return <MdRefresh className="text-blue-500" />;
            case "deleted": return <MdDelete className="text-red-500" />;
            case "login": return <MdCheck className="text-green-500" />;
            case "logout": return <MdClose className="text-gray-500" />;
            default: return <MdInfo className="text-gray-400" />;
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="p-3 md:p-6 bg-white rounded-xl shadow-lg border border-gray-100 m-2 md:m-6 min-h-[85vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
                        <Badge badgeContent={stats.unreadNotifications + stats.unreadOrderAlerts} color="error">
                            <MdNotificationsActive size={28} />
                        </Badge>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">Notifications & Activity</h2>
                        <p className="text-sm text-gray-500">Manage alerts, requests, and monitor activity.</p>
                    </div>
                </div>
                <Button 
                    fullWidth={window.innerWidth < 768}
                    startIcon={<FiRefreshCw />} 
                    onClick={fetchNotificationsData} 
                    disabled={loading}
                    variant="outlined"
                >
                    {loading ? "Loading..." : "Refresh"}
                </Button>
            </div>

            {/* Stats Cards - Adaptive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Unread Alerts</p>
                    <p className="text-2xl font-bold">{stats.unreadOrderAlerts}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Vendor Requests</p>
                    <p className="text-2xl font-bold">{stats.pendingVendorRequests}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">New Complaints</p>
                    <p className="text-2xl font-bold">{stats.newComplaints}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">Activity Today</p>
                    <p className="text-2xl font-bold">{stats.totalActivityToday}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md hidden lg:block">
                    <p className="text-xs opacity-80 uppercase tracking-wider font-bold">System Status</p>
                    <p className="text-lg font-bold">Operational</p>
                </div>
            </div>

            {/* Tabs - Scrollable for mobile */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
                    <Tab label="All" icon={<MdNotifications />} iconPosition="start" />
                    <Tab label="Orders" icon={<MdShoppingCart />} iconPosition="start" />
                    <Tab label="System" icon={<MdSystemUpdate />} iconPosition="start" />
                    <Tab label="Vendors" icon={<MdStore />} iconPosition="start" />
                    <Tab label="Complaints" icon={<FiAlertCircle />} iconPosition="start" />
                    <Tab label="Settings" icon={<MdSettings />} iconPosition="start" />
                    <Tab label="Logs" icon={<MdHistory />} iconPosition="start" />
                </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Content Areas */}
            <div className="mt-4">
                {/* TAB 0: ALL NOTIFICATIONS */}
                {tabValue === 0 && (
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Recent Feed</h3>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="order">Orders</MenuItem>
                                    <MenuItem value="system">System</MenuItem>
                                    <MenuItem value="vendor">Vendors</MenuItem>
                                    <MenuItem value="customer">Customers</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="space-y-3">
                            {[...orderAlerts, ...notifications].length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <MdNotifications size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg font-medium">Clear as a whistle!</p>
                                </div>
                            ) : (
                                [...orderAlerts, ...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20).map((item, index) => (
                                    <div key={item._id || index} className={`p-4 rounded-xl border ${item.isRead ? "bg-white border-gray-100" : "bg-blue-50/40 border-blue-100"} hover:shadow-sm transition-all`}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                            <div className="flex gap-3">
                                                <Avatar sx={{ bgcolor: item.alertType ? "#3b82f6" : "#eab308", width: 40, height: 40 }}>
                                                    {item.alertType ? <MdShoppingCart size={20}/> : <MdNotifications size={20}/>}
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 text-sm md:text-base">{item.title || item.message}</h4>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                                                        {item.customerName && <span>User: {item.customerName}</span>}
                                                        {item.orderNumber && <span>Order: #{item.orderNumber}</span>}
                                                        <span>{formatDate(item.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                {item.alertType && <Chip size="small" label={item.alertType.replace(/_/g, ' ')} color={getAlertTypeColor(item.alertType)} sx={{fontSize: '10px'}} />}
                                                {!item.isRead && (
                                                    <IconButton size="small" color="primary" onClick={() => markOrderAlertRead(item._id)}><MdCheck /></IconButton>
                                                )}
                                                <IconButton size="small" color="error" onClick={() => deleteItem("order-alert", item._id)}><MdDelete /></IconButton>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 1: ORDER ALERTS */}
                {tabValue === 1 && (
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Transactions</h3>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                    <MenuItem value="all">All Alerts</MenuItem>
                                    <MenuItem value="new_order">New Orders</MenuItem>
                                    <MenuItem value="payment_received">Payments</MenuItem>
                                    <MenuItem value="order_cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        {orderAlerts.filter(a => filterType === "all" || a.alertType === filterType).map(alert => (
                            <div key={alert._id} className={`p-4 rounded-xl border ${alert.isRead ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200 shadow-sm"}`}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="flex gap-4 items-center">
                                        <Avatar sx={{ bgcolor: alert.alertType.includes("failed") || alert.alertType.includes("cancelled") ? "#ef4444" : "#22c55e" }}>
                                            <MdShoppingCart />
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-bold text-sm md:text-base truncate">{alert.message}</p>
                                            <div className="flex flex-wrap gap-x-2 text-xs text-gray-500 mt-1">
                                                {alert.orderNumber && <span className="font-mono">#{alert.orderNumber}</span>}
                                                {alert.customerName && <span>• {alert.customerName}</span>}
                                                {alert.amount && <span className="font-bold text-green-600">• ₹{alert.amount}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-none pt-2 sm:pt-0">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(alert.createdAt)}</span>
                                        <div className="flex gap-1">
                                            <Chip size="small" label={alert.alertType.split('_')[0]} color={getAlertTypeColor(alert.alertType)} />
                                            <IconButton size="small" onClick={() => deleteItem("order-alert", alert._id)}><MdDelete /></IconButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 2: SYSTEM UPDATES */}
                {tabValue === 2 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Logs & Versions</h3>
                            <Button variant="contained" size="small" startIcon={<FiPlus />} onClick={() => { setDialogType("system-update"); setOpenDialog(true); }}>
                                New Log
                            </Button>
                        </div>
                        {systemUpdates.map(update => (
                            <div key={update._id} className={`p-4 md:p-5 rounded-xl border-l-4 shadow-sm ${update.updateType === "maintenance" ? "border-orange-500 bg-orange-50/30" : update.updateType === "security" ? "border-red-500 bg-red-50/30" : "border-blue-500 bg-blue-50/30"}`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h4 className="font-bold text-base md:text-lg">{update.title}</h4>
                                            <Chip size="small" label={update.updateType} color={update.updateType === "security" ? "error" : "info"} sx={{height: 20, fontSize: '10px'}} />
                                            {update.version && <Chip size="small" label={`v${update.version}`} variant="outlined" sx={{height: 20}} />}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{update.description}</p>
                                        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                                            {update.scheduledAt && <span>📅 Scheduled: {new Date(update.scheduledAt).toLocaleDateString()}</span>}
                                            <span>🕒 Created: {formatDate(update.createdAt)}</span>
                                        </div>
                                    </div>
                                    <IconButton size="small" color="error" onClick={() => deleteItem("system-update", update._id)}><MdDelete /></IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 3: VENDOR REQUESTS - Horizontal Scroll Container */}
                {tabValue === 3 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Onboarding</h3>
                            <Select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                            </Select>
                        </div>
                        <TableContainer component={Paper} elevation={0} className="border border-gray-100 rounded-xl overflow-x-auto">
                            <Table size="small">
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell sx={{fontWeight: 'bold', fontSize: '12px'}}>Vendor</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', fontSize: '12px'}}>Type</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', fontSize: '12px'}}>Status</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', fontSize: '12px'}}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vendorRequests.filter(r => filterStatus === "all" || r.status === filterStatus).map(request => (
                                        <TableRow key={request._id} hover>
                                            <TableCell>
                                                <div className="flex items-center gap-2 py-1">
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: "#10b981", fontSize: 12 }}>{request.vendorName[0]}</Avatar>
                                                    <div className="max-w-[120px] truncate">
                                                        <p className="font-bold text-xs">{request.vendorName}</p>
                                                        <p className="text-[10px] text-gray-500 truncate">{request.vendorEmail}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Chip size="small" label={request.requestType.split('_')[0]} variant="outlined" sx={{fontSize: '10px'}}/></TableCell>
                                            <TableCell>
                                                <Select size="small" sx={{fontSize: '11px'}} value={request.status} onChange={(e) => updateVendorRequestStatus(request._id, e.target.value)}>
                                                    <MenuItem value="pending">Pending</MenuItem>
                                                    <MenuItem value="approved">Approve</MenuItem>
                                                    <MenuItem value="rejected">Reject</MenuItem>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => deleteItem("vendor-request", request._id)}><MdDelete size={18}/></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}

                {/* TAB 4: COMPLAINTS */}
                {tabValue === 4 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Support Tickets</h3>
                            <Chip label={`${stats.newComplaints} New`} color="error" size="small" />
                        </div>
                        {customerComplaints.filter(c => filterStatus === "all" || c.status === filterStatus).map(complaint => (
                            <div key={complaint._id} className={`p-4 md:p-5 rounded-xl border shadow-sm ${complaint.status === "new" ? "border-red-100 bg-red-50/50" : "bg-white border-gray-100"}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex gap-4">
                                        <Avatar sx={{ bgcolor: "#fecaca", color: "#b91c1c", fontWeight: 'bold' }}>{complaint.customerName[0]}</Avatar>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h4 className="font-bold text-sm md:text-base">{complaint.customerName}</h4>
                                                <Chip size="small" label={complaint.priority} color={getPriorityColor(complaint.priority)} sx={{height: 18, fontSize: '9px'}} />
                                            </div>
                                            <p className="font-bold text-gray-700 text-sm mb-1">{complaint.subject}</p>
                                            <p className="text-xs text-gray-600 line-clamp-2 md:line-clamp-none">{complaint.description}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                                {complaint.orderNumber && <span>Order: #{complaint.orderNumber}</span>}
                                                <span>{formatDate(complaint.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 border-t md:border-none pt-3 md:pt-0">
                                        <Select size="small" sx={{fontSize: '11px', height: 32}} value={complaint.status} onChange={(e) => updateComplaintStatus(complaint._id, e.target.value)}>
                                            <MenuItem value="new">New</MenuItem>
                                            <MenuItem value="resolved">Resolved</MenuItem>
                                            <MenuItem value="escalated">Escalate</MenuItem>
                                        </Select>
                                        <IconButton size="small" color="error" onClick={() => deleteItem("complaint", complaint._id)}><MdDelete /></IconButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 5: SETTINGS */}
                {tabValue === 5 && (
                    <div className="max-w-xl mx-auto space-y-6 px-1">
                        <h3 className="text-lg font-bold text-gray-800 text-center">Notification Preferences</h3>
                        <Card variant="outlined" sx={{borderRadius: 3}}>
                            <CardContent className="p-4 md:p-6">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-600"><MdNotifications size={20} /> Email Alerts</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(settings.emailNotifications || {}).map(([key, value]) => (
                                        <FormControlLabel
                                            key={key}
                                            control={<Switch size="small" checked={value} onChange={(e) => setSettings({ ...settings, emailNotifications: { ...settings.emailNotifications, [key]: e.target.checked } })} />}
                                            label={<span className="text-xs font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{borderRadius: 3}}>
                            <CardContent className="p-4 md:p-6">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-indigo-600"><FiBell size={18} /> Push Alerts</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(settings.pushNotifications || {}).map(([key, value]) => (
                                        <FormControlLabel
                                            key={key}
                                            control={<Switch size="small" checked={value} onChange={(e) => setSettings({ ...settings, pushNotifications: { ...settings.pushNotifications, [key]: e.target.checked } })} />}
                                            label={<span className="text-xs font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Button variant="contained" fullWidth size="large" sx={{borderRadius: 2, py: 1.5, fontWeight: 'bold'}} onClick={saveSettings}>Apply Settings</Button>
                    </div>
                )}

                {/* TAB 6: ACTIVITY LOGS */}
                {tabValue === 6 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">System Logs</h3>
                            <Button variant="outlined" color="error" size="small" onClick={clearActivityLogs}>Purge Old</Button>
                        </div>
                        <TableContainer component={Paper} elevation={0} className="border border-gray-100 rounded-xl overflow-x-auto">
                            <Table size="small">
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell sx={{fontWeight: 'bold', fontSize: '11px'}}>User</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', fontSize: '11px'}}>Action</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', fontSize: '11px'}}>Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {activityLogs.map(log => (
                                        <TableRow key={log._id} hover>
                                            <TableCell>
                                                <div className="max-w-[120px] truncate">
                                                    <p className="font-bold text-xs">{log.userName || "System"}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase">{log.userRole}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {getActionIcon(log.action)}
                                                    <span className="text-xs text-gray-700 font-medium line-clamp-1">{log.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{whiteSpace: 'nowrap', fontSize: '11px', color: 'gray'}}>{formatDate(log.createdAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
            </div>

            {/* DIALOGS - Automatically Responsive by MUI */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{fontWeight: 'bold'}}>
                    {dialogType === "system-update" && "Post System Announcement"}
                </DialogTitle>
                <DialogContent>
                    {dialogType === "system-update" && (
                        <div className="space-y-4 pt-4">
                            <TextField fullWidth label="Title" variant="outlined" value={newSystemUpdate.title} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, title: e.target.value })} />
                            <TextField fullWidth label="Description" multiline rows={4} value={newSystemUpdate.description} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, description: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select label="Type" value={newSystemUpdate.updateType} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, updateType: e.target.value })}>
                                    <MenuItem value="announcement">Announcement</MenuItem>
                                    <MenuItem value="maintenance">Maintenance</MenuItem>
                                    <MenuItem value="feature">New Feature</MenuItem>
                                    <MenuItem value="security">Security</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField fullWidth label="Version" value={newSystemUpdate.version} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, version: e.target.value })} />
                            <TextField fullWidth label="Schedule" type="datetime-local" InputLabelProps={{ shrink: true }} value={newSystemUpdate.scheduledAt} onChange={(e) => setNewSystemUpdate({ ...newSystemUpdate, scheduledAt: e.target.value })} />
                        </div>
                    )}
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Discard</Button>
                    <Button variant="contained" onClick={() => {
                        if (dialogType === "system-update") createSystemUpdate();
                    }}>Publish</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Notifications;