import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { FiBriefcase, FiFileText, FiSave, FiInfo } from 'react-icons/fi';

const BUSINESS_TYPES = [
    { value: 'Individual', label: 'Individual', description: 'Single person business' },
    { value: 'Proprietorship', label: 'Proprietorship', description: 'Sole proprietorship firm' },
    { value: 'Partnership', label: 'Partnership', description: 'Partnership firm' },
    { value: 'LLP', label: 'LLP', description: 'Limited Liability Partnership' },
    { value: 'Private Limited', label: 'Private Limited', description: 'Private Limited Company' },
    { value: 'Public Limited', label: 'Public Limited', description: 'Public Limited Company' },
];

function BusinessInfoStep({ onComplete, businessType: initialBusinessType }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        businessName: '',
        tradeName: '',
        businessType: initialBusinessType || 'Individual',
        dateOfIncorporation: '',
        registrationNumber: '',
        // Business Address
        businessAddress: '',
        businessCity: '',
        businessState: '',
        businessPincode: '',
        // PAN Details
        panNumber: '',
        personalPanNumber: '',
        businessPanNumber: '',
        // GST Details
        gstNumber: '',
        gstPrincipalPlace: '',
        // MSME
        msmeNumber: '',
        udyamNumber: '',
        // Company specific
        cin: '',
        llpNumber: '',
    });

    useEffect(() => {
        fetchBusinessInfo();
    }, []);

    const fetchBusinessInfo = async () => {
        try {
            const { data } = await api.get('/api/seller/onboarding/business-info');
            if (data.success && data.businessInfo) {
                const info = data.businessInfo;
                setFormData(prev => ({
                    ...prev,
                    businessName: info.businessName || '',
                    tradeName: info.tradeName || '',
                    businessType: info.businessType || 'Individual',
                    dateOfIncorporation: info.dateOfIncorporation ? info.dateOfIncorporation.split('T')[0] : '',
                    registrationNumber: info.registrationNumber || '',
                    businessAddress: info.businessAddress || '',
                    businessCity: info.businessCity || '',
                    businessState: info.businessState || '',
                    businessPincode: info.businessPincode || '',
                    panNumber: info.panNumber || '',
                    personalPanNumber: info.personalPanNumber || '',
                    businessPanNumber: info.businessPanNumber || '',
                    gstNumber: info.gstNumber || '',
                    gstPrincipalPlace: info.gstPrincipalPlace || '',
                    msmeNumber: info.msmeNumber || '',
                    udyamNumber: info.udyamNumber || '',
                    cin: info.cin || '',
                    llpNumber: info.llpNumber || '',
                }));
            }
        } catch (error) {
            console.error('Failed to fetch business info:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.businessType || !formData.panNumber) {
            toast.error('Business type and PAN number are required');
            return;
        }

        // PAN validation
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData.panNumber.toUpperCase())) {
            toast.error('Invalid PAN format. Should be like ABCDE1234F');
            return;
        }

        // GST validation (if provided)
        if (formData.gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(formData.gstNumber.toUpperCase())) {
                toast.error('Invalid GST format');
                return;
            }
        }

        setSaving(true);
        try {
            const { data } = await api.put('/api/seller/onboarding/business-info', {
                ...formData,
                panNumber: formData.panNumber.toUpperCase(),
                gstNumber: formData.gstNumber ? formData.gstNumber.toUpperCase() : '',
            });

            if (data.success) {
                toast.success('Business info saved successfully');
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

    const isCompanyOrLLP = ['LLP', 'Private Limited', 'Public Limited'].includes(formData.businessType);
    const isPartnership = formData.businessType === 'Partnership';

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Type Selection */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiBriefcase className="text-indigo-500" /> Business Type
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BUSINESS_TYPES.map((type) => (
                        <label
                            key={type.value}
                            className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.businessType === type.value
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="businessType"
                                value={type.value}
                                checked={formData.businessType === type.value}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <span className="font-medium text-gray-900">{type.label}</span>
                            <span className="text-xs text-gray-500 mt-1">{type.description}</span>
                            {formData.businessType === type.value && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* Business Name */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business / Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Legal business name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trade Name / Brand Name
                        </label>
                        <input
                            type="text"
                            name="tradeName"
                            value={formData.tradeName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="If different from business name"
                        />
                    </div>
                    {isCompanyOrLLP && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Incorporation
                            </label>
                            <input
                                type="date"
                                name="dateOfIncorporation"
                                value={formData.dateOfIncorporation}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    )}
                    {isCompanyOrLLP && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {formData.businessType === 'LLP' ? 'LLP Number' : 'CIN (Corporate Identification Number)'}
                            </label>
                            <input
                                type="text"
                                name={formData.businessType === 'LLP' ? 'llpNumber' : 'cin'}
                                value={formData.businessType === 'LLP' ? formData.llpNumber : formData.cin}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder={formData.businessType === 'LLP' ? 'LLP-XXXXX' : 'U12345MH2020PTC123456'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Business Address */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Principal Place of Business</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Address
                        </label>
                        <input
                            type="text"
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Complete business address"
                        />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="businessCity"
                                value={formData.businessCity}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                name="businessState"
                                value={formData.businessState}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                            <input
                                type="text"
                                name="businessPincode"
                                value={formData.businessPincode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setFormData(prev => ({ ...prev, businessPincode: value }));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                maxLength={6}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* PAN Details */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiFileText className="text-indigo-500" /> PAN Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            PAN Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {isCompanyOrLLP ? 'Business/Company PAN' : 'Personal PAN'}
                        </p>
                    </div>
                    {isCompanyOrLLP && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Authorized Signatory's Personal PAN
                            </label>
                            <input
                                type="text"
                                name="personalPanNumber"
                                value={formData.personalPanNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, personalPanNumber: e.target.value.toUpperCase() }))}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                                placeholder="ABCDE1234F"
                                maxLength={10}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* GST Details */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">GST Details</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800 flex items-start gap-2">
                        <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>
                            GST is optional initially but mandatory within <strong>3 months</strong> of first successful order
                            or <strong>₹50,000</strong> total sales, whichever comes first.
                        </span>
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GSTIN
                        </label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                            placeholder="22AAAAA0000A1Z5"
                            maxLength={15}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Principal Place of Business (as per GST)
                        </label>
                        <input
                            type="text"
                            name="gstPrincipalPlace"
                            value={formData.gstPrincipalPlace}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Address registered in GST"
                        />
                    </div>
                </div>
            </div>

            {/* MSME Details */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">MSME / Udyam Registration</h3>
                <p className="text-sm text-gray-500 mb-4">Optional but recommended for benefits</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            MSME Number
                        </label>
                        <input
                            type="text"
                            name="msmeNumber"
                            value={formData.msmeNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="MSME registration number"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Udyam Registration Number
                        </label>
                        <input
                            type="text"
                            name="udyamNumber"
                            value={formData.udyamNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="UDYAM-XX-00-0000000"
                        />
                    </div>
                </div>
            </div>

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

export default BusinessInfoStep;
