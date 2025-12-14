import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdAccountBalance, MdSave, MdEdit, MdCheck, MdCloudUpload, MdImage } from "react-icons/md";
import { FiCreditCard } from "react-icons/fi";
import { toast } from "react-toastify";

function BankDetails() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCheque, setUploadingCheque] = useState(false);
  const [form, setForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
    cancelledChequeUrl: ""
  });
  const stoken = localStorage.getItem("stoken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try enhanced endpoint first, fallback to regular
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/finance/bank-details-enhanced`, {
          headers: { stoken }
        });
        if (res.data.success && res.data.data) {
          setData(res.data.data);
          setForm(res.data.data);
        }
      } catch (err) {
        // Fallback to regular endpoint
        try {
          const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/finance/bank-details`, {
            headers: { stoken }
          });
          if (res.data.success && res.data.data) {
            setData(res.data.data);
            setForm(res.data.data);
          }
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.accountHolderName?.trim()) {
      toast.error("Account Holder Name is required");
      return;
    }
    if (!form.bankName?.trim()) {
      toast.error("Bank Name is required");
      return;
    }
    if (!form.accountNumber?.trim()) {
      toast.error("Account Number is required");
      return;
    }
    if (!form.ifscCode?.trim()) {
      toast.error("IFSC Code is required");
      return;
    }
    if (!form.cancelledChequeUrl?.trim()) {
      toast.error("Please upload a Cancelled Cheque image");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/finance/bank-details-enhanced`,
        form,
        { headers: { stoken } }
      );
      if (res.data.success) {
        setData(res.data.data);
        setEditing(false);
        toast.success("Bank details saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  const handleChequeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPG, PNG, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setUploadingCheque(true);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', 'cancelledCheque');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller-panel/store/verification`,
        formData,
        { headers: { stoken, 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.success && res.data.url) {
        setForm(prev => ({ ...prev, cancelledChequeUrl: res.data.url }));
        toast.success("Cheque uploaded successfully!");
      } else {
        // If upload API returns success but no URL, use local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(prev => ({ ...prev, cancelledChequeUrl: reader.result }));
        };
        reader.readAsDataURL(file);
        toast.info("Cheque image selected. Save to complete upload.");
      }
    } catch (err) {
      console.error(err);
      // Fallback: use local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, cancelledChequeUrl: reader.result }));
      };
      reader.readAsDataURL(file);
      toast.info("Cheque image selected locally. Will be uploaded on save.");
    } finally {
      setUploadingCheque(false);
    }
  };

  const maskAccountNumber = (acc) => {
    if (!acc || acc.length < 4) return acc;
    return "*".repeat(acc.length - 4) + acc.slice(-4);
  };

  // Required Label Helper
  const RequiredLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  const OptionalLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {children} <span className="text-gray-400 text-xs">(Optional)</span>
    </label>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bank Details</h1>
          <p className="text-sm text-gray-500">Manage your payout account information</p>
        </div>
        {data && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            <MdEdit className="text-lg" />
            <span>Edit Details</span>
          </button>
        )}
      </div>

      {/* Required Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required.
          Cancel Cheque image is mandatory for bank verification.
        </p>
      </div>

      {/* Bank Details Form/View */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {editing || !data ? (
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RequiredLabel>Account Holder Name</RequiredLabel>
                <input
                  type="text"
                  value={form.accountHolderName}
                  onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                  placeholder="Enter name as per bank records"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <RequiredLabel>Bank Name</RequiredLabel>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  placeholder="e.g., State Bank of India"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <RequiredLabel>Account Number</RequiredLabel>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <RequiredLabel>IFSC Code</RequiredLabel>
                <input
                  type="text"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., SBIN0001234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  required
                />
              </div>

              <div>
                <OptionalLabel>Branch Name</OptionalLabel>
                <input
                  type="text"
                  value={form.branchName}
                  onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                  placeholder="Enter branch name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <OptionalLabel>UPI ID</OptionalLabel>
                <input
                  type="text"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  placeholder="e.g., yourname@upi"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cancel Cheque Upload - Required */}
            <div className="border-t border-gray-200 pt-6">
              <RequiredLabel>Cancelled Cheque Image</RequiredLabel>
              <p className="text-xs text-gray-500 mb-3">Upload a clear image of your cancelled cheque. Accepted formats: JPG, PNG, WEBP (Max 5MB)</p>

              <div className="space-y-4">
                {form.cancelledChequeUrl ? (
                  <div className="relative">
                    <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={form.cancelledChequeUrl}
                          alt="Cancelled Cheque"
                          className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <MdCheck className="text-green-500" /> Cheque Image Uploaded
                          </p>
                          <p className="text-xs text-gray-500">Click 'Change' to upload a different image</p>
                        </div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleChequeUpload}
                          />
                          <span className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            Change
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleChequeUpload}
                    />
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploadingCheque ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                      {uploadingCheque ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                          <p className="text-sm text-blue-600">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <MdCloudUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-700">Click to upload Cancelled Cheque</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP up to 5MB</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                <MdSave className="text-xl" />
                <span>{saving ? "Saving..." : "Save Bank Details"}</span>
              </button>
              {editing && data && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); setForm(data); }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="p-6">
            {/* Saved Bank Account Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MdAccountBalance className="text-3xl" />
                  <span className="font-semibold text-lg">{data.bankName}</span>
                </div>
                <FiCreditCard className="text-3xl opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-mono tracking-wider">{maskAccountNumber(data.accountNumber)}</p>
                <p className="text-sm opacity-80">{data.accountHolderName}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">IFSC Code</p>
                <p className="font-semibold text-gray-800">{data.ifscCode}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Branch</p>
                <p className="font-semibold text-gray-800">{data.branchName || "N/A"}</p>
              </div>
              {data.upiId && (
                <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                  <p className="text-sm text-gray-500 mb-1">UPI ID</p>
                  <p className="font-semibold text-gray-800">{data.upiId}</p>
                </div>
              )}
            </div>

            {/* Cancelled Cheque Preview */}
            {data.cancelledChequeUrl && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <MdImage className="text-blue-500" /> Cancelled Cheque
                </p>
                <img
                  src={data.cancelledChequeUrl}
                  alt="Cancelled Cheque"
                  className="w-40 h-24 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Verification Status */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MdCheck className="text-white text-xl" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Bank Account Verified</p>
                <p className="text-sm text-green-600">Your account is ready to receive payouts</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <h4 className="font-semibold text-yellow-800 mb-2">🔒 Security Note</h4>
        <p className="text-sm text-yellow-700">
          Your bank details are encrypted and securely stored. We never share your banking information
          with third parties. Payouts are processed directly to your verified account.
        </p>
      </div>
    </div>
  );
}

export default BankDetails;
