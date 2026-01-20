import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  MdAccountBalance,
  MdSave,
  MdEdit,
  MdCheck,
  MdCloudUpload,
  MdImage
} from "react-icons/md";
import { FiCreditCard } from "react-icons/fi";
import { toast } from "react-toastify";

function BankDetailsStep() {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/seller-panel/finance/bank-details-enhanced");
        if (res.data.success && res.data.data) {
          setData(res.data.data);
          setForm(res.data.data);
        }
      } catch {
        try {
          const res = await api.get("/api/seller-panel/finance/bank-details");
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

    if (!form.accountHolderName?.trim()) return toast.error("Account Holder Name is required");
    if (!form.bankName?.trim()) return toast.error("Bank Name is required");
    if (!form.accountNumber?.trim()) return toast.error("Account Number is required");
    if (!form.ifscCode?.trim()) return toast.error("IFSC Code is required");
    if (!form.cancelledChequeUrl?.trim()) return toast.error("Please upload a Cancelled Cheque image");

    setSaving(true);
    try {
      const res = await api.post("/api/seller-panel/finance/bank-details-enhanced", form);
      if (res.data.success) {
        setData(res.data.data);
        setEditing(false);
        toast.success("Bank details saved successfully!");
      }
    } catch {
      toast.error("Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  const handleChequeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) return toast.error("Invalid image format");
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (max 5MB)");

    setUploadingCheque(true);
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", "cancelledCheque");

    try {
      const res = await api.post("/api/seller-panel/store/verification", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success && res.data.url) {
        setForm(p => ({ ...p, cancelledChequeUrl: res.data.url }));
        toast.success("Cheque uploaded successfully!");
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () =>
        setForm(p => ({ ...p, cancelledChequeUrl: reader.result }));
      reader.readAsDataURL(file);
      toast.info("Cheque selected locally. Save to confirm.");
    } finally {
      setUploadingCheque(false);
    }
  };

  const maskAccountNumber = (acc) =>
    acc ? "*".repeat(acc.length - 4) + acc.slice(-4) : acc;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6  space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bank Details</h1>
          <p className="text-sm text-gray-500">Manage your payout account</p>
        </div>

        {data && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700"
          >
            <MdEdit /> Edit Details
          </button>
        )}
      </div>

      {/* NOTE */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span> are required.
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

        {/* EDIT MODE */}
        {editing || !data ? (
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                ["Account Holder Name*", "accountHolderName"],
                ["Bank Name*", "bankName"],
                ["Account Number*", "accountNumber"],
                ["IFSC Code*", "ifscCode"],
                ["Branch Name", "branchName"],
                ["UPI ID", "upiId"]
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <input
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* CHEQUE */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cancelled Cheque <span className="text-red-500">*</span>
              </label>

              <label className="block cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handleChequeUpload} />
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${uploadingCheque ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"}`}>
                  {uploadingCheque ? "Uploading..." : "Click to upload cheque image"}
                </div>
              </label>

              {form.cancelledChequeUrl && (
                <img src={form.cancelledChequeUrl} alt="Cheque" className="mt-4 w-40 rounded-lg border" />
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
              >
                <MdSave /> {saving ? "Saving..." : "Save Details"}
              </button>

              {data && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); setForm(data); }}
                  className="px-6 py-3 border rounded-xl"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          /* VIEW MODE */
          <div className="p-6 space-y-6">

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <MdAccountBalance className="text-3xl" />
                  <span className="font-semibold">{data.bankName}</span>
                </div>
                <FiCreditCard className="text-3xl opacity-60" />
              </div>
              <p className="text-2xl font-mono tracking-wider">{maskAccountNumber(data.accountNumber)}</p>
              <p className="opacity-80">{data.accountHolderName}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Info label="IFSC Code" value={data.ifscCode} />
              <Info label="Branch" value={data.branchName || "N/A"} />
              {data.upiId && <Info label="UPI ID" value={data.upiId} />}
            </div>

            {data.cancelledChequeUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <MdImage /> Cancelled Cheque
                </p>
                <img src={data.cancelledChequeUrl} className="w-40 rounded-lg border" />
              </div>
            )}

            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <MdCheck className="text-green-600 text-2xl" />
              <div>
                <p className="font-semibold text-green-800">Verified</p>
                <p className="text-sm text-green-600">Ready for payouts</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECURITY */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
        🔒 Your bank details are encrypted and securely stored.
      </div>
    </div>
  );
}

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold text-gray-800">{value}</p>
  </div>
);

export default BankDetailsStep;
