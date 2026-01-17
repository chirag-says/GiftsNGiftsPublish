import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { FiShield, FiCheck, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const DECLARATIONS = [
    {
        key: 'termsAccepted',
        title: 'Terms & Conditions',
        description: 'I have read and agree to the Seller Terms of Service, including the commission structure, payment terms, and platform policies.',
        required: true,
    },
    {
        key: 'kycDeclaration',
        title: 'KYC Declaration',
        description: 'I declare that all the information and documents provided for KYC verification are true, complete, and accurate to the best of my knowledge.',
        required: true,
    },
    {
        key: 'antiCounterfeitDeclaration',
        title: 'Anti-Counterfeit Declaration',
        description: 'I declare that I will not sell any counterfeit, fake, replica, or unauthorized products on the platform. I understand that selling counterfeit goods may result in immediate suspension and legal action.',
        required: true,
    },
    {
        key: 'productAuthenticityDeclaration',
        title: 'Product Authenticity Declaration',
        description: 'I declare that all products listed by me are genuine, original, and comply with applicable quality standards. I will provide valid authorization for branded products when required.',
        required: true,
    },
    {
        key: 'indemnityUndertaking',
        title: 'Indemnity Undertaking',
        description: 'I agree to indemnify and hold harmless the platform against any claims, damages, or liabilities arising from my products, listings, or business practices.',
        required: false,
    },
    {
        key: 'dataUsageConsent',
        title: 'Data Usage Consent',
        description: 'I consent to the collection, processing, and storage of my business data for the purpose of providing seller services, analytics, and platform improvements.',
        required: false,
    },
];

function DeclarationsStep({ onComplete }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [declarations, setDeclarations] = useState({
        termsAccepted: false,
        kycDeclaration: false,
        antiCounterfeitDeclaration: false,
        productAuthenticityDeclaration: false,
        indemnityUndertaking: false,
        dataUsageConsent: false,
    });
    const [acceptedAt, setAcceptedAt] = useState({});

    useEffect(() => {
        fetchDeclarations();
    }, []);

    const fetchDeclarations = async () => {
        try {
            const { data } = await api.get('/api/seller/onboarding/declarations');
            if (data.success && data.declarations) {
                const decl = data.declarations;
                setDeclarations({
                    termsAccepted: decl.termsAccepted || false,
                    kycDeclaration: decl.kycDeclaration || false,
                    antiCounterfeitDeclaration: decl.antiCounterfeitDeclaration || false,
                    productAuthenticityDeclaration: decl.productAuthenticityDeclaration || false,
                    indemnityUndertaking: decl.indemnityUndertaking || false,
                    dataUsageConsent: decl.dataUsageConsent || false,
                });
                setAcceptedAt({
                    termsAccepted: decl.termsAcceptedAt,
                    kycDeclaration: decl.kycDeclarationAt,
                    antiCounterfeitDeclaration: decl.antiCounterfeitDeclarationAt,
                    productAuthenticityDeclaration: decl.productAuthenticityDeclarationAt,
                    indemnityUndertaking: decl.indemnityUndertakingAt,
                    dataUsageConsent: decl.dataUsageConsentAt,
                });
            }
        } catch (error) {
            console.error('Failed to fetch declarations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setDeclarations(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSelectAll = () => {
        const allTrue = DECLARATIONS.every(d => declarations[d.key]);
        const newValue = !allTrue;
        const updated = {};
        DECLARATIONS.forEach(d => {
            updated[d.key] = newValue;
        });
        setDeclarations(updated);
    };

    const handleSubmit = async () => {
        // Validate required declarations
        const missingRequired = DECLARATIONS
            .filter(d => d.required && !declarations[d.key])
            .map(d => d.title);

        if (missingRequired.length > 0) {
            toast.error(`Please accept all required declarations: ${missingRequired.join(', ')}`);
            return;
        }

        setSaving(true);
        try {
            const { data } = await api.post('/api/seller/onboarding/declarations', declarations);

            if (data.success) {
                toast.success('Declarations accepted successfully');
                onComplete && onComplete();
            } else {
                toast.error(data.message || 'Failed to save declarations');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save declarations');
        } finally {
            setSaving(false);
        }
    };

    const requiredCount = DECLARATIONS.filter(d => d.required).length;
    const acceptedRequired = DECLARATIONS.filter(d => d.required && declarations[d.key]).length;
    const allRequiredAccepted = acceptedRequired === requiredCount;

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FiShield className="text-indigo-500" /> Compliance & Declarations
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Please read and accept the following declarations to complete your onboarding
                    </p>
                </div>
                <button
                    onClick={handleSelectAll}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    {DECLARATIONS.every(d => declarations[d.key]) ? 'Deselect All' : 'Select All'}
                </button>
            </div>

            {/* Progress */}
            <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-800">
                        Required Declarations
                    </span>
                    <span className="text-sm text-indigo-600">
                        {acceptedRequired} / {requiredCount} accepted
                    </span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                    <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${(acceptedRequired / requiredCount) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Declarations List */}
            <div className="space-y-4">
                {DECLARATIONS.map((declaration) => {
                    const isAccepted = declarations[declaration.key];
                    const wasAcceptedAt = acceptedAt[declaration.key];

                    return (
                        <label
                            key={declaration.key}
                            className={`block border rounded-xl p-4 cursor-pointer transition-all ${isAccepted
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isAccepted
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-gray-300'
                                    }`}>
                                    {isAccepted && <FiCheck className="w-4 h-4 text-white" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-900">{declaration.title}</h4>
                                        {declaration.required ? (
                                            <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">
                                                Required
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                                                Optional
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{declaration.description}</p>
                                    {wasAcceptedAt && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                            <FiCheckCircle /> Accepted on {new Date(wasAcceptedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <input
                                    type="checkbox"
                                    checked={isAccepted}
                                    onChange={() => handleToggle(declaration.key)}
                                    className="sr-only"
                                />
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-medium">Important</p>
                    <p className="mt-1">
                        By accepting these declarations, you agree to comply with all platform policies.
                        Violation of these terms may result in account suspension and legal action.
                    </p>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                <div className="text-sm text-gray-500">
                    {allRequiredAccepted ? (
                        <span className="text-green-600 flex items-center gap-2">
                            <FiCheckCircle /> All required declarations accepted
                        </span>
                    ) : (
                        <span className="text-amber-600 flex items-center gap-2">
                            <FiAlertCircle /> Please accept all required declarations
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={saving || !allRequiredAccepted}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${allRequiredAccepted
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <FiShield className="w-5 h-5" />
                    {saving ? 'Submitting...' : 'Complete Onboarding'}
                </button>
            </div>
        </div>
    );
}

export default DeclarationsStep;
