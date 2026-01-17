import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import {
    FiCheck, FiChevronRight, FiChevronLeft, FiUpload,
    FiUser, FiBriefcase, FiFileText, FiCreditCard, FiShield
} from 'react-icons/fi';

// Step Components
import BasicInfoStep from './steps/BasicInfoStep';
import BusinessInfoStep from './steps/BusinessInfoStep';
import KycDocumentsStep from './steps/KycDocumentsStep';
import BankDetailsStep from './steps/BankDetailsStep';
import DeclarationsStep from './steps/DeclarationsStep';

const STEPS = [
    { id: 1, title: 'Basic Info', icon: FiUser, description: 'Personal & Contact Details' },
    { id: 2, title: 'Business Details', icon: FiBriefcase, description: 'Business Information' },
    { id: 3, title: 'KYC Documents', icon: FiFileText, description: 'Upload Required Documents' },
    { id: 4, title: 'Bank Details', icon: FiCreditCard, description: 'Settlement Account' },
    { id: 5, title: 'Declarations', icon: FiShield, description: 'Terms & Compliance' },
];

function OnboardingWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [onboardingData, setOnboardingData] = useState(null);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [stepsCompleted, setStepsCompleted] = useState({});

    // Fetch onboarding status on mount
    useEffect(() => {
        fetchOnboardingStatus();
    }, []);

    const fetchOnboardingStatus = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/seller/onboarding/status');

            if (data.success) {
                setCurrentStep(data.data.currentStep || 1);
                setCompletionPercentage(data.data.completionPercentage || 0);
                setStepsCompleted(data.data.stepsCompleted || {});
                setOnboardingData(data.data);

                // If already completed, redirect to dashboard
                if (data.data.onboardingCompleted) {
                    toast.info('Onboarding already completed!');
                    navigate('/');
                }
            }
        } catch (error) {
            console.error('Failed to fetch onboarding status:', error);
            toast.error('Failed to load onboarding status');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (currentStep < 5) {
            try {
                setSaving(true);
                await api.put('/api/seller/onboarding/step', { step: currentStep + 1 });
                setCurrentStep(prev => prev + 1);
            } catch (error) {
                console.error('Failed to save progress:', error);
            } finally {
                setSaving(false);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleStepComplete = (stepId) => {
        setStepsCompleted(prev => ({ ...prev, [stepId]: true }));
        handleNext();
    };

    const handleComplete = async () => {
        try {
            setSaving(true);
            const { data } = await api.post('/api/seller/onboarding/complete');

            if (data.success) {
                toast.success('🎉 Onboarding completed! Your account is now under review.');
                navigate('/');
            } else {
                toast.error(data.message || 'Failed to complete onboarding');
            }
        } catch (error) {
            const errors = error.response?.data?.errors;
            if (errors) {
                errors.forEach(err => toast.error(err));
            } else {
                toast.error(error.response?.data?.message || 'Failed to complete onboarding');
            }
        } finally {
            setSaving(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <BasicInfoStep onComplete={() => handleStepComplete('basicInfo')} />;
            case 2:
                return <BusinessInfoStep onComplete={() => handleStepComplete('businessInfo')} businessType={onboardingData?.businessType} />;
            case 3:
                return <KycDocumentsStep onComplete={() => handleStepComplete('kycDocuments')} businessType={onboardingData?.businessType} />;
            case 4:
                return <BankDetailsStep onComplete={() => handleStepComplete('bankDetails')} />;
            case 5:
                return <DeclarationsStep onComplete={handleComplete} />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading onboarding...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Seller Onboarding</h1>
                            <p className="text-sm text-gray-500">Complete your profile to start selling</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Completion</div>
                            <div className="text-2xl font-bold text-indigo-600">{completionPercentage}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">
                            <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                            ></div>
                        </div>

                        {/* Steps */}
                        <div className="relative flex justify-between">
                            {STEPS.map((step) => {
                                const isCompleted = currentStep > step.id;
                                const isCurrent = currentStep === step.id;
                                const Icon = step.icon;

                                return (
                                    <div
                                        key={step.id}
                                        className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${isCurrent ? 'scale-110' : ''
                                            }`}
                                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : isCurrent
                                                        ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg'
                                                        : 'bg-white border-gray-300 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? <FiCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <div className="mt-2 text-center hidden sm:block">
                                            <div className={`text-xs font-semibold ${isCurrent ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-400 hidden md:block">{step.description}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Step Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white">
                            Step {currentStep}: {STEPS[currentStep - 1].title}
                        </h2>
                        <p className="text-indigo-100 text-sm mt-1">
                            {STEPS[currentStep - 1].description}
                        </p>
                    </div>

                    {/* Step Content */}
                    <div className="p-6">
                        {renderStepContent()}
                    </div>

                    {/* Navigation */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${currentStep === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FiChevronLeft className="w-5 h-5" />
                            Previous
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            Step {currentStep} of {STEPS.length}
                        </div>

                        {currentStep < 5 ? (
                            <button
                                onClick={handleNext}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Next'}
                                <FiChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Submitting...' : 'Complete Onboarding'}
                                <FiCheck className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OnboardingWizard;
