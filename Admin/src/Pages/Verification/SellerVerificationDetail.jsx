import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
    FiArrowLeft, FiCheck, FiX, FiEye, FiFileText, FiUser,
    FiBriefcase, FiCreditCard, FiShield, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';

function SellerVerificationDetail() {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState(null);
    const [summary, setSummary] = useState({});
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionModal, setRejectionModal] = useState({ open: false, type: '', path: '' });
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchSellerDetails();
    }, [sellerId]);

    const fetchSellerDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/api/admin/verification/seller/${sellerId}`);
            if (data.success) {
                setSeller(data.seller);
                setSummary(data.verificationSummary);
            }
        } catch (error) {
            console.error('Failed to fetch seller:', error);
            toast.error('Failed to load seller details');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDocument = async (documentPath) => {
        setActionLoading(true);
        try {
            const { data } = await api.post('/api/admin/verification/document', {
                sellerId,
                documentPath,
                action: 'verify'
            });

            if (data.success) {
                toast.success('Document verified');
                fetchSellerDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectDocument = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please enter rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const { data } = await api.post('/api/admin/verification/document', {
                sellerId,
                documentPath: rejectionModal.path,
                action: 'reject',
                rejectionReason
            });

            if (data.success) {
                toast.success('Document rejected');
                setRejectionModal({ open: false, type: '', path: '' });
                setRejectionReason('');
                fetchSellerDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifySeller = async () => {
        setActionLoading(true);
        try {
            const { data } = await api.post(`/api/admin/verification/seller/${sellerId}/verify`);
            if (data.success) {
                toast.success('Seller verified and activated!');
                fetchSellerDetails();
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) {
                errors.forEach(err => toast.error(err));
            } else {
                toast.error(error.response?.data?.message || 'Failed to verify seller');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSeller = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please enter rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const { data } = await api.post(`/api/admin/verification/seller/${sellerId}/reject`, {
                rejectionReason
            });
            if (data.success) {
                toast.success('Seller rejected');
                setRejectionModal({ open: false, type: '', path: '' });
                setRejectionReason('');
                fetchSellerDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject seller');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            'pending': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Uploaded' },
            'pending_review': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' },
            'verified': { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified' },
            'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
        };
        const { bg, text, label } = config[status] || config.pending;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>{label}</span>;
    };

    const renderDocumentCard = (doc, path, category) => {
        if (!doc || !doc.url) return null;

        return (
            <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-medium text-gray-800 capitalize">
                            {path.split('.').pop().replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="mt-1">{getStatusBadge(doc.status)}</div>
                    </div>
                    <FiFileText className="w-5 h-5 text-gray-400" />
                </div>

                {doc.url && (
                    <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-3"
                    >
                        <FiEye className="w-4 h-4" /> View Document
                    </a>
                )}

                {doc.uploadedAt && (
                    <p className="text-xs text-gray-400 mb-3">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                )}

                {doc.rejectionReason && (
                    <p className="text-sm text-red-600 mb-3 bg-red-50 px-2 py-1 rounded">
                        Rejection: {doc.rejectionReason}
                    </p>
                )}

                {doc.status === 'pending_review' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleVerifyDocument(path)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                            <FiCheck className="w-4 h-4" /> Verify
                        </button>
                        <button
                            onClick={() => setRejectionModal({ open: true, type: 'document', path })}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            <FiX className="w-4 h-4" /> Reject
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Seller not found</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/verification')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Seller Verification</h1>
                    <p className="text-gray-500">{seller.name} • {seller.email}</p>
                </div>
                {seller.status !== 'Active' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleVerifySeller}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                            <FiCheckCircle className="w-5 h-5" /> Approve Seller
                        </button>
                        <button
                            onClick={() => setRejectionModal({ open: true, type: 'seller', path: '' })}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            <FiX className="w-5 h-5" /> Reject Seller
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-lg font-bold text-gray-900">{seller.status}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-sm text-gray-500">Completion</p>
                    <p className="text-lg font-bold text-gray-900">
                        {seller.verificationStatus?.completionPercentage || 0}%
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-sm text-gray-500">Pending Review</p>
                    <p className="text-lg font-bold text-yellow-600">{summary.docsPendingReview || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border">
                    <p className="text-sm text-gray-500">Verified Docs</p>
                    <p className="text-lg font-bold text-green-600">{summary.docsVerified || 0}</p>
                </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiUser className="text-indigo-500" /> Basic Information
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{seller.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{seller.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{seller.phone || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Seller ID</p>
                        <p className="font-medium font-mono text-indigo-600">{seller.uniqueId || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">
                            {seller.address ?
                                `${seller.address.street || ''}, ${seller.address.city || ''}, ${seller.address.state || ''} - ${seller.address.pincode || ''}`
                                : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiBriefcase className="text-indigo-500" /> Business Information
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium">{seller.businessInfo?.businessType || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Business Name</p>
                        <p className="font-medium">{seller.businessInfo?.businessName || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">PAN Number</p>
                        <p className="font-medium font-mono">{seller.businessInfo?.panNumber || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">GSTIN</p>
                        <p className="font-medium font-mono">{seller.businessInfo?.gstNumber || '-'}</p>
                    </div>
                </div>
            </div>

            {/* KYC Documents */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiFileText className="text-indigo-500" /> KYC Documents
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderDocumentCard(seller.kycDocuments?.panCard, 'kycDocuments.panCard', 'kyc')}
                    {renderDocumentCard(seller.kycDocuments?.aadhaarCard, 'kycDocuments.aadhaarCard', 'kyc')}
                    {renderDocumentCard(seller.kycDocuments?.passportOrVoterId, 'kycDocuments.passportOrVoterId', 'kyc')}
                    {renderDocumentCard(seller.kycDocuments?.partnershipDeed, 'kycDocuments.partnershipDeed', 'kyc')}
                    {renderDocumentCard(seller.kycDocuments?.certificateOfIncorporation, 'kycDocuments.certificateOfIncorporation', 'kyc')}
                    {renderDocumentCard(seller.kycDocuments?.moaAoa, 'kycDocuments.moaAoa', 'kyc')}
                    {renderDocumentCard(seller.kycDocuments?.llpAgreement, 'kycDocuments.llpAgreement', 'kyc')}
                    {renderDocumentCard(seller.kycDocuments?.boardResolution, 'kycDocuments.boardResolution', 'kyc')}
                    {renderDocumentCard(seller.documents?.identityProof, 'documents.identityProof', 'general')}
                    {renderDocumentCard(seller.documents?.addressProof, 'documents.addressProof', 'general')}
                    {renderDocumentCard(seller.documents?.businessLogo, 'documents.businessLogo', 'general')}
                </div>
            </div>

            {/* Tax Documents */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiCreditCard className="text-indigo-500" /> Tax & Statutory Documents
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderDocumentCard(seller.taxDocuments?.gstCertificate, 'taxDocuments.gstCertificate', 'tax')}
                    {renderDocumentCard(seller.taxDocuments?.msmeUdyamCertificate, 'taxDocuments.msmeUdyamCertificate', 'tax')}
                    {renderDocumentCard(seller.taxDocuments?.tradeLicense, 'taxDocuments.tradeLicense', 'tax')}
                    {renderDocumentCard(seller.documents?.tradeLicense, 'documents.tradeLicense', 'general')}
                    {renderDocumentCard(seller.documents?.gstCertificate, 'documents.gstCertificate', 'general')}
                </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiCreditCard className="text-indigo-500" /> Bank Details
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Account Holder Name</p>
                        <p className="font-medium">{seller.bankDetails?.accountHolderName || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">{seller.bankDetails?.bankName || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Account Number</p>
                        <p className="font-medium font-mono">{seller.bankDetails?.accountNumber || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">IFSC Code</p>
                        <p className="font-medium font-mono">{seller.bankDetails?.ifscCode || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Bank Verified</p>
                        <p className={`font-medium ${seller.bankDetails?.isBankVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {seller.bankDetails?.isBankVerified ? 'Yes' : 'No'}
                        </p>
                    </div>
                    {seller.bankDetails?.cancelledChequeUrl && (
                        <div>
                            <p className="text-sm text-gray-500">Cancelled Cheque</p>
                            <a
                                href={seller.bankDetails.cancelledChequeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                                <FiEye className="w-4 h-4" /> View
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Declarations */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiShield className="text-indigo-500" /> Declarations & Compliance
                    </h2>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-4">
                    {[
                        { key: 'termsAccepted', label: 'Terms Accepted' },
                        { key: 'kycDeclaration', label: 'KYC Declaration' },
                        { key: 'antiCounterfeitDeclaration', label: 'Anti-Counterfeit Declaration' },
                        { key: 'productAuthenticityDeclaration', label: 'Product Authenticity' },
                        { key: 'dataUsageConsent', label: 'Data Usage Consent' },
                    ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                            {seller.declarations?.[key] ? (
                                <FiCheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <FiAlertCircle className="w-5 h-5 text-gray-300" />
                            )}
                            <span className={seller.declarations?.[key] ? 'text-gray-900' : 'text-gray-400'}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rejection Modal */}
            {rejectionModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {rejectionModal.type === 'seller' ? 'Reject Seller' : 'Reject Document'}
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter reason for rejection..."
                            />
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setRejectionModal({ open: false, type: '', path: '' });
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={rejectionModal.type === 'seller' ? handleRejectSeller : handleRejectDocument}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SellerVerificationDetail;
