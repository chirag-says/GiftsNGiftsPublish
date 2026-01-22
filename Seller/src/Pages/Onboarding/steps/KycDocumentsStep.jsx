import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { FiUpload, FiCheck, FiX, FiClock, FiFileText, FiEye, FiTrash2 } from 'react-icons/fi';

const DOCUMENT_CONFIG = {
    Individual: [
        { key: 'panCard', name: 'PAN Card', required: true, category: 'kyc' },
        { key: 'aadhaarCard', name: 'Aadhaar Card', required: true, category: 'kyc' },
        { key: 'identityProof', name: 'Identity Proof (Passport/Voter ID/DL)', required: false, category: 'general' },
        { key: 'addressProof', name: 'Address Proof', required: true, category: 'general' },
        { key: 'businessLogo', name: 'Business Logo', required: true, category: 'general' },
    ],
    Proprietorship: [
        { key: 'panCard', name: 'PAN Card', required: true, category: 'kyc' },
        { key: 'aadhaarCard', name: 'Aadhaar Card', required: true, category: 'kyc' },
        { key: 'identityProof', name: 'Identity Proof', required: false, category: 'general' },
        { key: 'addressProof', name: 'Address Proof', required: true, category: 'general' },
        { key: 'businessLogo', name: 'Business Logo', required: true, category: 'general' },
        { key: 'tradeLicense', name: 'Trade License / Shop Establishment', required: false, category: 'tax' },
    ],
    Partnership: [
        { key: 'panCard', name: 'Firm PAN Card', required: true, category: 'kyc' },
        { key: 'partnershipDeed', name: 'Partnership Deed', required: true, category: 'kyc' },
        { key: 'addressProof', name: 'Address Proof', required: true, category: 'general' },
        { key: 'businessLogo', name: 'Business Logo', required: true, category: 'general' },
        { key: 'tradeLicense', name: 'Trade License', required: false, category: 'tax' },
    ],
    LLP: [
        { key: 'panCard', name: 'LLP PAN Card', required: true, category: 'kyc' },
        { key: 'certificateOfIncorporation', name: 'Certificate of Incorporation', required: true, category: 'kyc' },
        { key: 'llpAgreement', name: 'LLP Agreement', required: true, category: 'kyc' },
        { key: 'boardResolution', name: 'Board Resolution / Authorization Letter', required: true, category: 'kyc' },
        { key: 'addressProof', name: 'Address Proof', required: true, category: 'general' },
        { key: 'businessLogo', name: 'Business Logo', required: true, category: 'general' },
    ],
    'Private Limited': [
        { key: 'panCard', name: 'Company PAN Card', required: true, category: 'kyc' },
        { key: 'certificateOfIncorporation', name: 'Certificate of Incorporation', required: true, category: 'kyc' },
        { key: 'moaAoa', name: 'MOA & AOA', required: true, category: 'kyc' },
        { key: 'boardResolution', name: 'Board Resolution', required: true, category: 'kyc' },
        { key: 'authorizationLetter', name: 'Authorization Letter', required: true, category: 'kyc' },
        { key: 'addressProof', name: 'Address Proof', required: true, category: 'general' },
        { key: 'businessLogo', name: 'Business Logo', required: true, category: 'general' },
    ],
    'Public Limited': [
        { key: 'panCard', name: 'Company PAN Card', required: true, category: 'kyc' },
        { key: 'certificateOfIncorporation', name: 'Certificate of Incorporation', required: true, category: 'kyc' },
        { key: 'moaAoa', name: 'MOA & AOA', required: true, category: 'kyc' },
        { key: 'boardResolution', name: 'Board Resolution', required: true, category: 'kyc' },
        { key: 'authorizationLetter', name: 'Authorization Letter', required: true, category: 'kyc' },
        { key: 'addressProof', name: 'Address Proof', required: true, category: 'general' },
        { key: 'businessLogo', name: 'Business Logo', required: true, category: 'general' },
    ],
};

const OPTIONAL_DOCUMENTS = [
    { key: 'gstCertificate', name: 'GST Certificate', category: 'tax' },
    { key: 'msmeUdyamCertificate', name: 'MSME / Udyam Certificate', category: 'tax' },
    { key: 'shopEstablishmentCertificate', name: 'Shop & Establishment Certificate', category: 'tax' },
];

function KycDocumentsStep({ onComplete, businessType = 'Individual' }) {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState({});
    const [documents, setDocuments] = useState({
        kyc: {},
        tax: {},
        general: {},
    });

    const requiredDocs = DOCUMENT_CONFIG[businessType] || DOCUMENT_CONFIG['Individual'];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get('/api/seller/onboarding/documents');
            if (data.success) {
                setDocuments({
                    kyc: data.kycDocuments || {},
                    tax: data.taxDocuments || {},
                    general: data.legacyDocuments || {},
                });
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (docKey, category, file) => {
        if (!file) return;

        // Validate file - images only for now
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
            'application/pdf'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload JPG, PNG, WebP images only');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setUploading(prev => ({ ...prev, [docKey]: true }));

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', docKey);

            let endpoint = '/api/seller/onboarding/documents/general';
            if (category === 'kyc') {
                endpoint = '/api/seller/onboarding/documents/kyc';
            } else if (category === 'tax') {
                endpoint = '/api/seller/onboarding/documents/tax';
            }

            const { data } = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success(`${docKey} uploaded successfully`);
                fetchDocuments(); // Refresh documents
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(prev => ({ ...prev, [docKey]: false }));
        }
    };

    const getDocumentStatus = (docKey, category) => {
        const categoryMap = { kyc: 'kyc', tax: 'tax', general: 'general' };
        const doc = documents[categoryMap[category]]?.[docKey];
        return doc || { url: '', status: 'pending' };
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="w-3 h-3" /> Verified
                    </span>
                );
            case 'pending_review':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <FiClock className="w-3 h-3" /> Under Review
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiX className="w-3 h-3" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Not Uploaded
                    </span>
                );
        }
    };

    const renderDocumentCard = (doc, category) => {
        const docStatus = getDocumentStatus(doc.key, category);
        const isUploading = uploading[doc.key];

        return (
            <div
                key={doc.key}
                className={`border rounded-xl p-4 transition-all ${docStatus.url ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-300 bg-white'
                    }`}
            >
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                            {doc.name}
                            {doc.required && <span className="text-red-500 text-sm">*</span>}
                        </h4>
                        <div className="mt-1">{getStatusBadge(docStatus.status)}</div>
                    </div>
                    <FiFileText className="w-6 h-6 text-gray-400" />
                </div>

                {docStatus.url ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <a
                                href={docStatus.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-indigo-600"
                            >
                                <FiEye /> View
                            </a>

                            <button
                                type="button"
                                onClick={() => handleRemove(doc.key, category)}
                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                            >
                                <FiTrash2 /> Remove
                            </button>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-indigo-600 cursor-pointer">
                            <FiUpload /> Re-upload
                            <input
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={(e) => handleUpload(doc.key, category, e.target.files[0])}
                            />
                        </label>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50 rounded-lg transition-all">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        ) : (
                            <>
                                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Click to upload</span>
                                <span className="text-xs text-gray-400 mt-1">JPG, PNG,  WebP (Max 5MB)</span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleUpload(doc.key, category, e.target.files[0])}
                        />

                    </label>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const requiredCount = requiredDocs.filter(d => d.required).length;
    const uploadedRequired = requiredDocs.filter(d => d.required && getDocumentStatus(d.key, d.category).url).length;
    const handleRemove = async (docKey, category) => {
        try {
            const categoryMap = {
                kyc: 'kycDocuments',
                tax: 'taxDocuments',
                general: 'documents'
            };

            await api.delete(
                `/api/seller/onboarding/documents/${categoryMap[category]}/${docKey}`
            );

            toast.success('Document removed');
            fetchDocuments();
        } catch (error) {
            toast.error('Failed to remove document');
        }
    };

    return (
        <div className="space-y-8">
            {/* Progress */}
            <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-800">
                        Required Documents Progress
                    </span>
                    <span className="text-sm text-indigo-600">
                        {uploadedRequired} / {requiredCount} uploaded
                    </span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                    <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${(uploadedRequired / requiredCount) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Required Documents */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Required Documents for {businessType}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {requiredDocs.map((doc) => renderDocumentCard(doc, doc.category))}
                </div>
            </div>

            {/* Optional Documents */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Optional Documents</h3>
                <p className="text-sm text-gray-500 mb-4">
                    These documents are optional but recommended for faster verification
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    {OPTIONAL_DOCUMENTS.map((doc) => renderDocumentCard({ ...doc, required: false }, doc.category))}
                </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={() => {
                        if (uploadedRequired < requiredCount) {
                            toast.warning(`Please upload all required documents (${uploadedRequired}/${requiredCount} done)`);
                        } else {
                            onComplete && onComplete();
                        }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
                >
                    Continue to Bank Details
                </button>
            </div>
        </div>
    );
}

export default KycDocumentsStep;
