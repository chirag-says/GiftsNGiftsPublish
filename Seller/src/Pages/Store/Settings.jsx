import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";
import { LuStore, LuSave, LuCamera, LuSettings, LuInfo } from "react-icons/lu";
import { MdBusiness, MdVerified, MdBeachAccess, MdCheckCircle, MdPending, MdError, MdUpload, MdSchedule } from "react-icons/md";
import { FiFileText, FiCreditCard, FiMapPin, FiShield, FiCamera, FiCalendar, FiAlertCircle, FiBell, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";

function Settings() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);


  // Check if we came from GST page with a specific tab request
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // General Tab State
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "",
    storeLogo: "",
    storeBanner: "",
    storeDescription: "",
    storeEmail: "",
    storePhone: "",
    storeAlternatePhone: "",
    storeAddress: ""
  });

  // Business Tab State - Updated with all required fields
  const [businessInfo, setBusinessInfo] = useState({
    ownerName: "",
    businessName: "",
    businessType: "Individual",
    registrationNumber: "",
    // Address fields (Required)
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessPincode: "",
    businessCountry: "India",
    // PAN Details
    panNumber: "", // Required
    personalPanNumber: "", // Optional
    businessPanNumber: "", // Optional
    // GST (Optional)
    gstNumber: ""
  });

  // Verification State - Updated document list
  const [verification, setVerification] = useState({
    status: "Pending",
    requirements: [
      { name: "Owner Passport Photo", key: "ownerPhoto", status: "pending", required: true, description: "Your passport size photo" },
      { name: "Business Logo", key: "businessLogo", status: "pending", required: true, description: "Your store/business logo" },
      { name: "Identity Proof", key: "identityProof", status: "pending", required: true, description: "Aadhar/PAN/Voter ID" },
      { name: "Trade License", key: "tradeLicense", status: "pending", required: true, description: "Business registration certificate" },
      { name: "Address Proof", key: "addressProof", status: "pending", required: true, description: "Utility bill/Bank statement" },
      { name: "GST Certificate", key: "gstCertificate", status: "pending", required: false, description: "Optional - GST registration" }
    ]
  });

  // Preferences Tab State
  const [preferences, setPreferences] = useState({
    holidayMode: false,
    holidayStartDate: "",
    holidayEndDate: "",
    holidayMessage: "We're currently on a break and will be back soon!",
    autoReplyEnabled: true,
    autoReplyMessage: "Thank you for your message. We're currently on holiday and will respond when we return.",
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    stockAlerts: true,
    reviewAlerts: true
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          api.get('/api/seller-panel/store/settings'),
          api.get('/api/seller-panel/store/business-info'),
          api.get('/api/seller-panel/store/verification'),
          api.get('/api/seller-panel/store/holiday-mode')
        ]);

        const [settingsRes, businessRes, verificationRes, holidayRes] = results;

        if (settingsRes.status === 'fulfilled' && settingsRes.value.data.success && settingsRes.value.data.data) {
          setGeneralSettings(prev => ({ ...prev, ...settingsRes.value.data.data }));
        }
        if (businessRes.status === 'fulfilled' && businessRes.value.data.success && businessRes.value.data.data) {
          setBusinessInfo(prev => ({ ...prev, ...businessRes.value.data.data }));
        }
        if (verificationRes.status === 'fulfilled' && verificationRes.value.data.success && verificationRes.value.data.data) {
          setVerification(prev => ({ ...prev, ...verificationRes.value.data.data }));
        }
        if (holidayRes.status === 'fulfilled' && holidayRes.value.data.success && holidayRes.value.data.data) {
          const hData = holidayRes.value.data.data;
          setPreferences(prev => ({
            ...prev,
            holidayMode: hData.isEnabled || false,
            holidayStartDate: hData.startDate ? new Date(hData.startDate).toISOString().split('T')[0] : "",
            holidayEndDate: hData.endDate ? new Date(hData.endDate).toISOString().split('T')[0] : "",
            holidayMessage: hData.message || prev.holidayMessage,
            autoReplyEnabled: hData.autoReplyEnabled ?? true,
            autoReplyMessage: hData.autoReplyMessage || prev.autoReplyMessage
          }));
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const res = await api.post('/api/seller-panel/store/settings', generalSettings);
      if (res.data.success) toast.success("Store settings saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    // Validation for required fields
    if (!businessInfo.ownerName?.trim()) {
      toast.error("Owner Name is required");
      return;
    }
    if (!businessInfo.businessAddress?.trim()) {
      toast.error("Business Address is required");
      return;
    }
    if (!businessInfo.businessCity?.trim()) {
      toast.error("City is required");
      return;
    }
    if (!businessInfo.businessState?.trim()) {
      toast.error("State is required");
      return;
    }
    if (!businessInfo.panNumber?.trim()) {
      toast.error("PAN Number is required");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/api/seller-panel/store/business-info',
        { businessInfo }
      );
      if (res.data.success) toast.success("Business info saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save business info");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const res = await api.post('/api/seller-panel/store/holiday-mode', {
        isEnabled: preferences.holidayMode,
        startDate: preferences.holidayStartDate,
        endDate: preferences.holidayEndDate,
        message: preferences.holidayMessage,
        autoReplyEnabled: preferences.autoReplyEnabled,
        autoReplyMessage: preferences.autoReplyMessage
      });
      if (res.data.success) toast.success("Preferences saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async (docType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(docType);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', docType);

      try {
        const res = await api.post(
          '/api/seller-panel/store/verification',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (res.data.success) {
          toast.success("Document uploaded successfully!");
          setVerification(prev => ({
            ...prev,
            requirements: prev.requirements.map(r =>
              r.key === docType ? { ...r, status: 'pending_review' } : r
            )
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload document");
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const tabs = [
    { id: "general", label: "General", icon: LuStore },
    { id: "business", label: "Business", icon: MdBusiness },
    { id: "preferences", label: "Preferences", icon: LuSettings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "verified": return "text-green-600 bg-green-100";
      case "pending_review": return "text-yellow-600 bg-yellow-100";
      case "rejected": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified": return <MdCheckCircle className="text-green-500" />;
      case "pending_review": return <MdPending className="text-yellow-500" />;
      case "rejected": return <MdError className="text-red-500" />;
      default: return <MdUpload className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "verified": return "Verified";
      case "pending_review": return "Under Review";
      case "rejected": return "Rejected";
      default: return "Not Submitted";
    }
  };

  // Helper for required field label
  const RequiredLabel = ({ children, required = true }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const OptionalLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children} <span className="text-gray-400 text-xs">(Optional)</span>
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store profile, business details, and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                ? "border-indigo-500 text-indigo-600 bg-indigo-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ============ GENERAL TAB ============ */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Store Banner & Logo Preview */}
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <div
                  className="h-40 bg-gradient-to-br from-indigo-600 to-purple-700 relative"
                  style={generalSettings.storeBanner ? { backgroundImage: `url(${generalSettings.storeBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-white text-sm font-medium shadow-sm">
                    <LuCamera className="w-4 h-4" /> Change Banner
                  </button>
                </div>
                <div className="p-4 -mt-12 relative">
                  <div className="flex items-end gap-4">
                    <div className="w-24 h-24 bg-white rounded-xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                      {generalSettings.storeLogo ? (
                        <img src={generalSettings.storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                      ) : (
                        <LuStore className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">{generalSettings.storeName || "Your Store Name"}</h2>
                      <p className="text-gray-500 text-sm">{generalSettings.storeDescription?.slice(0, 50) || "No description"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <LuStore className="text-indigo-500" /> Store Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={generalSettings.storeName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={generalSettings.storeDescription}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeDescription: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none"
                      placeholder="Describe your store..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input
                      type="text"
                      value={generalSettings.storeLogo}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeLogo: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <FiBell className="text-purple-500" /> Contact Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={generalSettings.storeEmail}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeEmail: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      placeholder="store@example.com"
                    />
                  </div>

                  {/* Phone & Alternate Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={generalSettings.storePhone}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, storePhone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                      <input
                        type="tel"
                        value={generalSettings.storeAlternatePhone || ""}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeAlternatePhone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={generalSettings.storeAddress}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                      rows="2"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-none"
                      placeholder="Store address..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSaveGeneral}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  <LuSave className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ============ BUSINESS TAB ============ */}
          {activeTab === "business" && (
            <div className="space-y-6">
              {/* Verification Status Banner */}
              <div className={`rounded-xl p-4 border-2 ${verification.status === 'Verified' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-3">
                  {verification.status === 'Verified' ? (
                    <MdVerified className="text-3xl text-green-600" />
                  ) : (
                    <FiShield className="text-3xl text-yellow-600" />
                  )}
                  <div>
                    <h4 className={`font-semibold ${verification.status === 'Verified' ? 'text-green-800' : 'text-yellow-800'}`}>
                      {verification.status === 'Verified' ? 'Your Business is Verified!' : 'Verification Required'}
                    </h4>
                    <p className={`text-sm ${verification.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {verification.status === 'Verified'
                        ? 'You have access to all seller features'
                        : 'Complete verification to unlock all features. Fields marked with * are required.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Details Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <FiUser className="text-blue-500" /> Owner Details
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <RequiredLabel>Owner Name</RequiredLabel>
                    <input
                      type="text"
                      value={businessInfo.ownerName}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      placeholder="Full name of business owner"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <MdBusiness className="text-blue-500" /> Business Profile
                  </h3>
                  <div>
                    <OptionalLabel>Legal Business Name</OptionalLabel>
                    <input
                      type="text"
                      value={businessInfo.businessName}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      placeholder="Your legal business name"
                    />
                  </div>
                  <div>
                    <RequiredLabel>Business Type</RequiredLabel>
                    <select
                      value={businessInfo.businessType}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Individual">Individual / Sole Proprietor</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">Limited Liability Partnership (LLP)</option>
                      <option value="Private Limited">Private Limited Company</option>
                    </select>
                  </div>
                  <div>
                    <OptionalLabel>Registration Number</OptionalLabel>
                    <input
                      type="text"
                      value={businessInfo.registrationNumber}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      placeholder="CIN / LLPIN / Registration No."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <FiFileText className="text-green-500" /> Tax Information
                  </h3>
                  <div>
                    <RequiredLabel>PAN Number</RequiredLabel>
                    <input
                      type="text"
                      value={businessInfo.panNumber}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none uppercase"
                      placeholder="AAAAA0000A"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">10-character PAN card number</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <OptionalLabel>Personal PAN</OptionalLabel>
                      <input
                        type="text"
                        value={businessInfo.personalPanNumber}
                        onChange={(e) => setBusinessInfo(prev => ({ ...prev, personalPanNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none uppercase"
                        placeholder="AAAAA0000A"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <OptionalLabel>Business PAN</OptionalLabel>
                      <input
                        type="text"
                        value={businessInfo.businessPanNumber}
                        onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessPanNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none uppercase"
                        placeholder="AAAAA0000A"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div>
                    <OptionalLabel>GST Number</OptionalLabel>
                    <input
                      type="text"
                      value={businessInfo.gstNumber}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none uppercase"
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                    />
                    <p className="text-xs text-gray-500 mt-1">15-character GST identification number (if applicable)</p>
                  </div>
                </div>
              </div>

              {/* Business Address - All Required */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <FiMapPin className="text-red-500" /> Business Address <span className="text-red-500 text-sm">(Required)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <RequiredLabel>Street Address</RequiredLabel>
                    <input
                      type="text"
                      value={businessInfo.businessAddress}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessAddress: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                      placeholder="Building, Street, Area"
                    />
                  </div>
                  <div>
                    <RequiredLabel>City</RequiredLabel>
                    <input
                      type="text"
                      value={businessInfo.businessCity}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessCity: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <RequiredLabel>State</RequiredLabel>
                    <input
                      type="text"
                      value={businessInfo.businessState}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessState: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <OptionalLabel>Pincode</OptionalLabel>
                    <input
                      type="text"
                      value={businessInfo.businessPincode}
                      onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessPincode: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Document Verification - Updated */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <MdVerified className="text-indigo-500" /> Document Verification
                </h3>
                <p className="text-sm text-gray-500">Documents marked with <span className="text-red-500">*</span> are mandatory. GST is optional.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {verification.requirements.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(doc.status)}
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {doc.name} {doc.required && <span className="text-red-500">*</span>}
                          </p>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                          <p className={`text-xs ${getStatusColor(doc.status).split(' ')[0]}`}>{getStatusText(doc.status)}</p>
                        </div>
                      </div>
                      {doc.status !== 'verified' && doc.status !== 'pending_review' && (
                        <button
                          onClick={() => handleUploadDocument(doc.key)}
                          disabled={uploading === doc.key}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {uploading === doc.key ? '...' : 'Upload'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSaveBusiness}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  <LuSave className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ============ PREFERENCES TAB ============ */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Holiday Mode */}
              <div className={`rounded-xl p-5 border-2 transition-all ${preferences.holidayMode ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${preferences.holidayMode ? 'bg-orange-100' : 'bg-gray-200'}`}>
                      <MdBeachAccess className={`text-2xl ${preferences.holidayMode ? 'text-orange-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Holiday Mode</h3>
                      <p className="text-sm text-gray-500">
                        {preferences.holidayMode ? "Your store is paused" : "Your store is open"}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.holidayMode}
                      onChange={(e) => setPreferences(prev => ({ ...prev, holidayMode: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {preferences.holidayMode && (
                  <div className="mt-4 pt-4 border-t border-orange-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={preferences.holidayStartDate}
                          onChange={(e) => setPreferences(prev => ({ ...prev, holidayStartDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={preferences.holidayEndDate}
                          onChange={(e) => setPreferences(prev => ({ ...prev, holidayEndDate: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Message</label>
                      <textarea
                        value={preferences.holidayMessage}
                        onChange={(e) => setPreferences(prev => ({ ...prev, holidayMessage: e.target.value }))}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 flex items-center gap-2">
                  <FiBell className="text-blue-500" /> Notification Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive updates via SMS' },
                    { key: 'orderAlerts', label: 'Order Alerts', desc: 'Get notified for new orders' },
                    { key: 'stockAlerts', label: 'Low Stock Alerts', desc: 'Alert when stock is low' },
                    { key: 'reviewAlerts', label: 'Review Alerts', desc: 'New review notifications' },
                    { key: 'autoReplyEnabled', label: 'Auto-Reply (Holiday)', desc: 'Auto-respond during holiday' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences[item.key]}
                        onChange={(e) => setPreferences(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  <LuSave className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;