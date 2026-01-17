import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { FiCreditCard, FiUpload, FiCheck, FiAlertCircle, FiSave } from 'react-icons/fi';

function BankDetailsStep({ onComplete }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingCheque, setUploadingCheque] = useState(false);
    const [formData, setFormData] = useState({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        branchName: '',
        upiId: '',
        cancelledChequeUrl: '',
    });
    const [bankVerified, setBankVerified] = useState(false);

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            const { data } = await api.get('/api/seller/onboarding/bank-details');
            if (data.success && data.bankDetails) {
                const bank = data.bankDetails;
                setFormData(prev => ({
                    ...prev,
                    accountHolderName: bank.accountHolderName || '',
                    bankName: bank.bankName || '',
                    accountNumber: bank.fullAccountNumber || '',
                    confirmAccountNumber: bank.fullAccountNumber || '',
                    ifscCode: bank.ifscCode || '',
                    branchName: bank.branchName || '',
                    upiId: bank.upiId || '',
                    cancelledChequeUrl: bank.cancelledChequeUrl || '',
                }));
                setBankVerified(bank.isBankVerified || false);
            }
        } catch (error) {
            console.error('Failed to fetch bank details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChequeUpload = async (file) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload JPG, PNG, or PDF files only');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setUploadingCheque(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('cheque', file);

            const { data } = await api.post('/api/seller/onboarding/bank-details/cancelled-cheque', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                setFormData(prev => ({ ...prev, cancelledChequeUrl: data.cancelledChequeUrl }));
                toast.success('Cancelled cheque uploaded successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploadingCheque(false);
        }
    };

    const validateIFSC = (ifsc) => {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifsc.toUpperCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.accountHolderName || !formData.bankName || !formData.accountNumber || !formData.ifscCode) {
            toast.error('Please fill all required fields');
            return;
        }

        if (formData.accountNumber !== formData.confirmAccountNumber) {
            toast.error('Account numbers do not match');
            return;
        }

        if (!validateIFSC(formData.ifscCode)) {
            toast.error('Invalid IFSC code format. Should be like SBIN0000123');
            return;
        }

        setSaving(true);
        try {
            const { data } = await api.put('/api/seller/onboarding/bank-details', {
                accountHolderName: formData.accountHolderName,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode.toUpperCase(),
                branchName: formData.branchName,
                upiId: formData.upiId,
            });

            if (data.success) {
                toast.success('Bank details saved successfully');
                onComplete && onComplete();
            } else {
                toast.error(data.message || 'Failed to save');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-medium">Bank Account for Settlement</p>
                    <p className="mt-1">
                        Your earnings will be settled to this bank account. Please ensure the details match
                        your cancelled cheque or bank passbook.
                    </p>
                </div>
            </div>

            {/* Account Details */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiCreditCard className="text-indigo-500" /> Bank Account Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Holder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Name as per bank records"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">Must match exactly with bank records</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., State Bank of India"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Branch Name
                        </label>
                        <input
                            type="text"
                            name="branchName"
                            value={formData.branchName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Andheri West Branch"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setFormData(prev => ({ ...prev, accountNumber: value }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter account number"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="confirmAccountNumber"
                            value={formData.confirmAccountNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setFormData(prev => ({ ...prev, confirmAccountNumber: value }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Re-enter account number"
                            required
                        />
                        {formData.accountNumber && formData.confirmAccountNumber &&
                            formData.accountNumber !== formData.confirmAccountNumber && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <FiAlertCircle /> Account numbers do not match
                                </p>
                            )}
                        {formData.accountNumber && formData.confirmAccountNumber &&
                            formData.accountNumber === formData.confirmAccountNumber && (
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <FiCheck /> Account numbers match
                                </p>
                            )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            IFSC Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase().slice(0, 11);
                                setFormData(prev => ({ ...prev, ifscCode: value }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                            placeholder="SBIN0000123"
                            maxLength={11}
                            required
                        />
                        {formData.ifscCode && !validateIFSC(formData.ifscCode) && (
                            <p className="text-xs text-amber-600 mt-1">Format: 4 letters + 0 + 6 characters</p>
                        )}
                        {formData.ifscCode && validateIFSC(formData.ifscCode) && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <FiCheck /> Valid IFSC format
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            UPI ID (Optional)
                        </label>
                        <input
                            type="text"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="yourname@upi"
                        />
                    </div>
                </div>
            </div>

            {/* Cancelled Cheque Upload */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Cancelled Cheque / Bank Proof
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Upload a cancelled cheque or first page of bank passbook for verification
                </p>

                {formData.cancelledChequeUrl ? (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <FiCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Cheque Uploaded</p>
                                    <a
                                        href={formData.cancelledChequeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-indigo-600 hover:underline"
                                    >
                                        View document
                                    </a>
                                </div>
                            </div>
                            <label className="text-sm text-indigo-600 cursor-pointer hover:underline">
                                Replace
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => handleChequeUpload(e.target.files[0])}
                                />
                            </label>
                        </div>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                        {uploadingCheque ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        ) : (
                            <>
                                <FiUpload className="w-10 h-10 text-gray-400 mb-3" />
                                <span className="text-sm font-medium text-gray-700">Click to upload cancelled cheque</span>
                                <span className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 5MB)</span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => handleChequeUpload(e.target.files[0])}
                            disabled={uploadingCheque}
                        />
                    </label>
                )}
            </div>

            {/* Verification Status */}
            {bankVerified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <FiCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-green-800">Bank Account Verified</p>
                        <p className="text-sm text-green-600">Your bank account has been verified successfully</p>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                    <FiAlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                        <p className="font-medium text-amber-800">Bank Verification Pending</p>
                        <p className="text-sm text-amber-600">
                            Your bank details will be verified after submission
                        </p>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    <FiSave className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save & Continue'}
                </button>
            </div>
        </form>
    );
}

export default BankDetailsStep;
