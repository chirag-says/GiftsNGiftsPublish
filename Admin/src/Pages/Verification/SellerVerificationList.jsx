import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
    FiUser, FiSearch, FiFilter, FiCheckCircle, FiXCircle,
    FiClock, FiEye, FiChevronRight, FiRefreshCw, FiFileText
} from 'react-icons/fi';

function SellerVerificationList() {
    const [loading, setLoading] = useState(true);
    const [sellers, setSellers] = useState([]);
    const [stats, setStats] = useState({});
    const [filter, setFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchStats();
        fetchSellers();
    }, [filter, page]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/api/admin/verification/stats');
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/admin/verification/pending?status=${filter}&page=${page}&limit=20`);
            if (data.success) {
                setSellers(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch sellers:', error);
            toast.error('Failed to load sellers');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'UnderReview': 'bg-blue-100 text-blue-800',
            'PartiallyVerified': 'bg-purple-100 text-purple-800',
            'Active': 'bg-green-100 text-green-800',
            'Suspended': 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredSellers = sellers.filter(seller =>
        seller.name?.toLowerCase().includes(search.toLowerCase()) ||
        seller.email?.toLowerCase().includes(search.toLowerCase()) ||
        seller.uniqueId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Seller Verification</h1>
                    <p className="text-gray-500">Review and verify seller documents</p>
                </div>
                <button
                    onClick={() => { fetchStats(); fetchSellers(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                >
                    <FiRefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div
                    onClick={() => setFilter('pending')}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${filter === 'pending' ? 'bg-yellow-100 ring-2 ring-yellow-500' : 'bg-white hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                            <FiClock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                            <p className="text-sm text-gray-500">Pending</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('underReview')}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${filter === 'underReview' ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <FiFileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.underReview || 0}</p>
                            <p className="text-sm text-gray-500">Under Review</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('verified')}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${filter === 'verified' ? 'bg-green-100 ring-2 ring-green-500' : 'bg-white hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                            <FiCheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
                            <p className="text-sm text-gray-500">Verified</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('rejected')}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${filter === 'rejected' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-white hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                            <FiXCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.suspended || 0}</p>
                            <p className="text-sm text-gray-500">Rejected</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSellers || 0}</p>
                            <p className="text-sm text-gray-500">Total Sellers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Sellers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredSellers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FiUser className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No sellers found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Seller</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Business Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Completion</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Joined</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredSellers.map((seller) => (
                                <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-semibold">
                                                    {seller.name?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{seller.name}</p>
                                                <p className="text-sm text-gray-500">{seller.email}</p>
                                                {seller.uniqueId && (
                                                    <p className="text-xs text-indigo-600 font-mono">{seller.uniqueId}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">
                                            {seller.businessInfo?.businessType || 'Not specified'}
                                        </span>
                                        {seller.businessInfo?.businessName && (
                                            <p className="text-xs text-gray-400">{seller.businessInfo.businessName}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(seller.status)}`}>
                                            {seller.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 rounded-full"
                                                    style={{ width: `${seller.verificationStatus?.completionPercentage || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {seller.verificationStatus?.completionPercentage || 0}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a
                                            href={`/verification/${seller._id}`}
                                            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                                        >
                                            Review <FiChevronRight className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SellerVerificationList;
