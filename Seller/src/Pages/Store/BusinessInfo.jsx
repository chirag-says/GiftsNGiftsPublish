import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdBusiness, MdEdit, MdSave, MdClose, MdVerified, MdPerson } from "react-icons/md";
import { FiFileText, FiCreditCard, FiMapPin, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";

function BusinessInfo() {
  const [info, setInfo] = useState({
    // Owner Details (Required)
    ownerName: "",
    // Business Details
    businessName: "",
    businessType: "Individual",
    registrationNumber: "",
    // Address (Required)
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const stoken = localStorage.getItem("stoken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/store/business-info`, {
          headers: { stoken }
        });
        if (res.data.success && res.data.data) {
          setInfo(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    // Validation for required fields
    if (!info.ownerName?.trim()) {
      toast.error("Owner Name is required");
      return;
    }
    if (!info.businessAddress?.trim()) {
      toast.error("Business Address is required");
      return;
    }
    if (!info.businessCity?.trim()) {
      toast.error("City is required");
      return;
    }
    if (!info.businessState?.trim()) {
      toast.error("State is required");
      return;
    }
    if (!info.panNumber?.trim()) {
      toast.error("PAN Number is required");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/store/business-info`,
        { businessInfo: info },
        { headers: { stoken } }
      );
      if (res.data.success) {
        setEditing(false);
        toast.success("Business info saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save business info");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.name.includes("pan") || e.target.name === "gstNumber"
      ? e.target.value.toUpperCase()
      : e.target.value;
    setInfo(prev => ({ ...prev, [e.target.name]: value }));
  };

  // Required Label Helper
  const RequiredLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  const OptionalLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children} <span className="text-gray-400 text-xs">(Optional)</span>
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Business Information</h1>
          <p className="text-sm text-gray-500">Manage your legal and tax details</p>
        </div>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MdClose /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <MdSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
            >
              <MdEdit /> Edit Info
            </button>
          )}
        </div>
      </div>

      {/* Required Fields Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are mandatory for verification.
          GST is optional but recommended for business operations above ₹40 lakhs turnover.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <MdVerified className="text-2xl text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800">Verification Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Complete your business information to get verified and start receiving payments directly to your bank account.
            </p>
          </div>
        </div>
      </div>

      {/* Owner Details - New Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <MdPerson className="text-purple-500" /> Owner Details
        </h3>

        <div>
          <RequiredLabel>Owner/Proprietor Name</RequiredLabel>
          <input
            type="text"
            name="ownerName"
            value={info.ownerName}
            onChange={handleChange}
            disabled={!editing}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
            placeholder="Full name of business owner"
          />
          <p className="text-xs text-gray-500 mt-1">Name as per identity proof documents</p>
        </div>
      </div>

      {/* Business Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Profile */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <MdBusiness className="text-blue-500" /> Business Profile
          </h3>

          <div>
            <OptionalLabel>Legal Business Name</OptionalLabel>
            <input
              type="text"
              name="businessName"
              value={info.businessName}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="Your legal business name"
            />
          </div>

          <div>
            <RequiredLabel>Business Type</RequiredLabel>
            <select
              name="businessType"
              value={info.businessType}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
            >
              <option value="Individual">Individual / Sole Proprietor</option>
              <option value="Partnership">Partnership</option>
              <option value="LLP">Limited Liability Partnership (LLP)</option>
              <option value="Private Limited">Private Limited Company</option>
              <option value="Public Limited">Public Limited Company</option>
            </select>
          </div>

          <div>
            <OptionalLabel>Registration Number</OptionalLabel>
            <input
              type="text"
              name="registrationNumber"
              value={info.registrationNumber}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="CIN / LLPIN / Registration No."
            />
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FiFileText className="text-green-500" /> Tax Information
          </h3>

          <div>
            <RequiredLabel>PAN Number</RequiredLabel>
            <input
              type="text"
              name="panNumber"
              value={info.panNumber}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 uppercase"
              placeholder="AAAAA0000A"
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">10-character PAN card number (Required)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <OptionalLabel>Personal PAN</OptionalLabel>
              <input
                type="text"
                name="personalPanNumber"
                value={info.personalPanNumber}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 uppercase"
                placeholder="AAAAA0000A"
                maxLength={10}
              />
            </div>
            <div>
              <OptionalLabel>Business PAN</OptionalLabel>
              <input
                type="text"
                name="businessPanNumber"
                value={info.businessPanNumber}
                onChange={handleChange}
                disabled={!editing}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 uppercase"
                placeholder="AAAAA0000A"
                maxLength={10}
              />
            </div>
          </div>

          <div>
            <OptionalLabel>GST Number</OptionalLabel>
            <input
              type="text"
              name="gstNumber"
              value={info.gstNumber}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 uppercase"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">15-character GST identification number (if applicable)</p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <FiCreditCard />
              <span className="text-sm font-medium">TDS will be deducted at 1% for verified sellers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Address */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FiMapPin className="text-red-500" /> Registered Business Address <span className="text-red-500 text-sm">(Required)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <RequiredLabel>Street Address</RequiredLabel>
            <input
              type="text"
              name="businessAddress"
              value={info.businessAddress}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="Building, Street, Area"
            />
          </div>

          <div>
            <RequiredLabel>City</RequiredLabel>
            <input
              type="text"
              name="businessCity"
              value={info.businessCity}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="City"
            />
          </div>

          <div>
            <RequiredLabel>State</RequiredLabel>
            <input
              type="text"
              name="businessState"
              value={info.businessState}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="State"
            />
          </div>

          <div>
            <OptionalLabel>Pincode</OptionalLabel>
            <input
              type="text"
              name="businessPincode"
              value={info.businessPincode}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
              placeholder="000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              name="businessCountry"
              value={info.businessCountry}
              onChange={handleChange}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <FiInfo className="text-blue-500" /> Why is this important?
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Legal compliance for business operations</li>
          <li>• Required for processing payouts above ₹50,000</li>
          <li>• Appears on customer invoices and tax documents</li>
          <li>• Verified sellers get a trust badge on their store</li>
        </ul>
      </div>
    </div>
  );
}

export default BusinessInfo;
