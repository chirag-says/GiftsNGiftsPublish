import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
    Button,
    Tabs,
    Tab,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Chip
} from "@mui/material";
import {
    MdCheck,
    MdClose,
    MdPending,
    MdCheckCircle,
    MdCancel,
    MdRefresh,
    MdVisibility,
    MdDelete
} from "react-icons/md";
import { LuClock, LuUser, LuMail, LuCalendar, LuMessageSquare } from "react-icons/lu";

function CategoryRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 0=pending, 1=approved, 2=rejected, 3=all
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

    // Dialog states
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const statusFilter = ['pending', 'approved', 'rejected', ''][tabValue];

    useEffect(() => {
        fetchRequests();
    }, [tabValue]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const url = statusFilter
                ? `/api/category-requests/all?status=${statusFilter}`
                : '/api/category-requests/all';

            const res = await api.get(url);
            if (res.data.success) {
                setRequests(res.data.requests);
                setCounts(res.data.counts);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to fetch category requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request) => {
        setActionLoading(true);
        try {
            const res = await api.put(`/api/category-requests/approve/${request._id}`, {
                adminNote: "Category approved and created successfully"
            });

            if (res.data.success) {
                toast.success(`Category "${request.categoryname}" has been approved!`);
                fetchRequests();
                setViewDialogOpen(false);
            }
        } catch (error) {
            console.error("Error approving request:", error);
            toast.error(error.response?.data?.message || "Failed to approve request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        setActionLoading(true);
        try {
            const res = await api.put(`/api/category-requests/reject/${selectedRequest._id}`, {
                reason: rejectReason || "Category request rejected by admin"
            });

            if (res.data.success) {
                toast.success(`Category request "${selectedRequest.categoryname}" has been rejected`);
                fetchRequests();
                setRejectDialogOpen(false);
                setViewDialogOpen(false);
                setRejectReason("");
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error(error.response?.data?.message || "Failed to reject request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (request) => {
        if (!window.confirm(`Are you sure you want to delete the request for "${request.categoryname}"?`)) {
            return;
        }

        try {
            const res = await api.delete(`/api/category-requests/${request._id}`);
            if (res.data.success) {
                toast.success("Request deleted successfully");
                fetchRequests();
            }
        } catch (error) {
            console.error("Error deleting request:", error);
            toast.error("Failed to delete request");
        }
    };

    const openViewDialog = (request) => {
        setSelectedRequest(request);
        setViewDialogOpen(true);
    };

    const openRejectDialog = (request) => {
        setSelectedRequest(request);
        setRejectReason("");
        setRejectDialogOpen(true);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Chip icon={<MdPending />} label="Pending" color="warning" size="small" />;
            case 'approved':
                return <Chip icon={<MdCheckCircle />} label="Approved" color="success" size="small" />;
            case 'rejected':
                return <Chip icon={<MdCancel />} label="Rejected" color="error" size="small" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="shadow-md rounded-md py-4 px-5 bg-white min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h4 className="text-xl font-bold text-gray-800">Category Requests</h4>
                    <p className="text-sm text-gray-500">Review and approve seller category requests.</p>
                </div>
                <Button
                    variant="outlined"
                    onClick={fetchRequests}
                    startIcon={<MdRefresh />}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <MdPending className="text-3xl text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
                    <p className="text-xs text-yellow-600">Pending</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <MdCheckCircle className="text-3xl text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-700">{counts.approved}</p>
                    <p className="text-xs text-green-600">Approved</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <MdCancel className="text-3xl text-red-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-700">{counts.rejected}</p>
                    <p className="text-xs text-red-600">Rejected</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <LuClock className="text-3xl text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-blue-700">{counts.total}</p>
                    <p className="text-xs text-blue-600">Total</p>
                </div>
            </div>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
                    <Tab
                        label={`Pending (${counts.pending})`}
                        icon={<MdPending />}
                        iconPosition="start"
                    />
                    <Tab
                        label={`Approved (${counts.approved})`}
                        icon={<MdCheckCircle />}
                        iconPosition="start"
                    />
                    <Tab
                        label={`Rejected (${counts.rejected})`}
                        icon={<MdCancel />}
                        iconPosition="start"
                    />
                    <Tab
                        label="All"
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Requests Table */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <CircularProgress />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <MdPending className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-lg">No {statusFilter || ''} requests found</p>
                </div>
            ) : (
                <div className="overflow-auto">
                    <table className="w-full border-collapse text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Image</th>
                                <th className="px-4 py-3">Category Name</th>
                                <th className="px-4 py-3">Requested By</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img
                                            src={req.image?.url}
                                            alt={req.categoryname}
                                            className="w-12 h-12 rounded-md object-cover bg-gray-100"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        {req.categoryname}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-700">{req.sellerName}</p>
                                            <p className="text-gray-500 text-xs">{req.sellerEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {formatDate(req.createdAt)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(req.status)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-1">
                                            <IconButton
                                                size="small"
                                                onClick={() => openViewDialog(req)}
                                                title="View Details"
                                            >
                                                <MdVisibility />
                                            </IconButton>
                                            {req.status === 'pending' && (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleApprove(req)}
                                                        title="Approve"
                                                    >
                                                        <MdCheck />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => openRejectDialog(req)}
                                                        title="Reject"
                                                    >
                                                        <MdClose />
                                                    </IconButton>
                                                </>
                                            )}
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(req)}
                                                title="Delete"
                                            >
                                                <MdDelete />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Details Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="!font-bold">
                    Category Request Details
                </DialogTitle>
                <DialogContent dividers>
                    {selectedRequest && (
                        <div className="space-y-4">
                            {/* Image */}
                            <div className="flex justify-center">
                                <img
                                    src={selectedRequest.image?.url}
                                    alt={selectedRequest.categoryname}
                                    className="w-40 h-40 rounded-lg object-cover border"
                                />
                            </div>

                            {/* Category Name */}
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800">{selectedRequest.categoryname}</h3>
                                <div className="mt-2">{getStatusBadge(selectedRequest.status)}</div>
                            </div>

                            {/* Details */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <LuUser className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Requested By</p>
                                        <p className="font-medium">{selectedRequest.sellerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <LuMail className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium">{selectedRequest.sellerEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <LuCalendar className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Requested On</p>
                                        <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                                    </div>
                                </div>
                                {selectedRequest.reason && (
                                    <div className="flex items-start gap-3">
                                        <LuMessageSquare className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Reason/Description</p>
                                            <p className="font-medium">{selectedRequest.reason}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedRequest.adminResponse && (
                                    <div className="border-t pt-3 mt-3">
                                        <p className="text-xs text-gray-500">Admin Response</p>
                                        <p className="font-medium text-gray-700">{selectedRequest.adminResponse}</p>
                                        {selectedRequest.reviewedAt && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Reviewed on {formatDate(selectedRequest.reviewedAt)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    {selectedRequest?.status === 'pending' && (
                        <>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => openRejectDialog(selectedRequest)}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApprove(selectedRequest)}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <CircularProgress size={20} /> : "Approve"}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="!font-bold text-red-600">
                    Reject Category Request
                </DialogTitle>
                <DialogContent>
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to reject the request for <strong>"{selectedRequest?.categoryname}"</strong>?
                    </p>
                    <TextField
                        fullWidth
                        label="Reason for rejection (optional)"
                        placeholder="Provide a reason for the seller..."
                        multiline
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleReject}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={20} /> : "Reject Request"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default CategoryRequests;
