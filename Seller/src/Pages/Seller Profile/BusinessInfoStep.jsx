import React, { useState } from "react";
import useSellerBusinessDetails from "../../hooks/useSellerBusinessDetails";
import useSellerDocuments from "../../hooks/useSellerDocuments";
import api from "../../utils/api";
import { FiEye, FiEdit2, FiSave, FiX, FiCheckCircle, FiInfo, FiFileText, FiMapPin } from "react-icons/fi";
import { toast } from "react-toastify";

const BusinessInfoStep = () => {
  const { data, loading, error, refetch } = useSellerBusinessDetails();
  const { data: docsData } = useSellerDocuments();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
const BUSINESS_FIELD_MAP = {
  Individual: ["businessName", "tradeName", "panNumber"],
  Proprietorship: ["businessName", "tradeName", "panNumber"],
  Partnership: ["businessName", "registrationNumber", "panNumber"],
  LLP: ["businessName", "llpNumber", "panNumber", "dateOfIncorporation"],
  "Private Limited": ["businessName", "cin", "panNumber", "dateOfIncorporation"],
  "Public Limited": ["businessName", "cin", "panNumber", "dateOfIncorporation"],
};

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      <p className="text-gray-500 font-medium">Fetching Business Records...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-100">
      <FiInfo className="mx-auto text-3xl text-red-400 mb-2" />
      <p className="text-red-600 font-bold">{error}</p>
    </div>
  );

  const { businessInfo, sellerStatus, verificationStatus } = data;
  const documents = docsData?.documents || {};

  const handleEdit = () => {
    setForm(businessInfo);
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
  try {
    const payload = {
      businessType: form.businessType,
      businessName: form.businessName,
      tradeName: form.tradeName,
      businessAddress: form.businessAddress,
      businessCity: form.businessCity,
      businessState: form.businessState,
      businessPincode: form.businessPincode,
    };

    const res = await api.put(
      "/api/seller/profile/business-details",
      payload
    );

    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Update failed");
    }

    toast.success("Business details updated successfully");
    setIsEditing(false);

    // ✅ NOW this will work
    await refetch();

  } catch (err) {
    console.error("Update error:", err);
    toast.error(err.message || "Update failed");
  }
};





  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* HEADER CARD */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="px-8 py-8 md:px-12 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-white rounded-2xl border-2 border-gray-100 p-2 flex items-center justify-center shadow-sm">
              {businessInfo.logo ? (
                <img src={businessInfo.logo} alt="Logo" className="max-h-full object-contain" />
              ) : (
                <FiFileText className="text-4xl text-gray-200" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{businessInfo.businessName || "Your Business"}</h2>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">
                  <FiX /> Cancel
                </button>
                <button onClick={handleSave} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                  <FiSave /> Save Details
                </button>
              </>
            ) : (
              <button onClick={handleEdit} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                <FiEdit2 /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">

          {(() => {
  const activeFields =
    BUSINESS_FIELD_MAP[businessInfo.businessType] || [];

  return (
    <Section title="Registration Details" icon={FiCheckCircle}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Business Type – always visible */}
        <ReadOnly
          label="Business Type"
          value={businessInfo.businessType}
        />

        {/* Business Name */}
        {activeFields.includes("businessName") && (
          <EditableField
            label="Business / Company Name"
            name="businessName"
            isEditing={isEditing}
            value={isEditing ? form.businessName : businessInfo.businessName}
            onChange={handleChange}
          />
        )}

        {/* Trade Name */}
        {activeFields.includes("tradeName") && (
          <EditableField
            label="Trade Name"
            name="tradeName"
            isEditing={isEditing}
            value={isEditing ? form.tradeName : businessInfo.tradeName}
            onChange={handleChange}
          />
        )}

        {/* Partnership Registration Number */}
        {activeFields.includes("registrationNumber") && (
          <ReadOnly
            label="Registration Number"
            value={businessInfo.registrationNumber}
          />
        )}

        {/* LLP Number */}
        {activeFields.includes("llpNumber") && (
          <ReadOnly
            label="LLP Number"
            value={businessInfo.llpNumber}
          />
        )}

        {/* CIN */}
        {activeFields.includes("cin") && (
          <ReadOnly
            label="CIN Number"
            value={businessInfo.cin}
          />
        )}

        {/* Date of Incorporation */}
        {activeFields.includes("dateOfIncorporation") && (
          <ReadOnly
            label="Date of Incorporation"
            value={
              businessInfo.dateOfIncorporation
                ? new Date(
                    businessInfo.dateOfIncorporation
                  ).toLocaleDateString()
                : "—"
            }
          />
        )}

        {/* Always visible */}
        <ReadOnly label="PAN Number" value={businessInfo.panNumber} />
        <ReadOnly label="GST Number" value={businessInfo.gstNumber} />
        <ReadOnly label="Udyam Number" value={businessInfo.udyamNumber} />

      </div>
    </Section>
  );
})()}


            {/* ADDRESS INFO */}
            <Section title="Headquarters Address" icon={FiMapPin}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <EditableField label="Street / Full Address" name="businessAddress" isEditing={isEditing} value={isEditing ? form.businessAddress : businessInfo.businessAddress} onChange={handleChange} />
                </div>
                <EditableField label="City" name="businessCity" isEditing={isEditing} value={isEditing ? form.businessCity : businessInfo.businessCity} onChange={handleChange} />
                <EditableField label="State" name="businessState" isEditing={isEditing} value={isEditing ? form.businessState : businessInfo.businessState} onChange={handleChange} />
                <EditableField label="Postal Pincode" name="businessPincode" isEditing={isEditing} value={isEditing ? form.businessPincode : businessInfo.businessPincode} onChange={handleChange} />
              </div>
            </Section>

          </div>

          {/* DOCUMENTS SECTION */}
          <div className="mt-16 pt-12 border-t border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
              <FiFileText className="text-indigo-600" /> Compliance Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(documents).length === 0 ? (
                <div className="col-span-full py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-medium italic">No legal documents archived yet</p>
                </div>
              ) : (
                Object.entries(documents).map(([group, docs]) => (
                  <div key={group} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2">{group}</h4>
                    {Object.entries(docs).map(([k, d]) => (
                      <div key={k} className="flex items-center justify-between bg-gray-50/50 border border-gray-100 p-4 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                        <div>
                          <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">{k.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Verified</p>
                        </div>
                        <a href={d.url} target="_blank" rel="noreferrer" className="h-10 w-10 flex items-center justify-center bg-white rounded-xl text-indigo-600 shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white transition-all">
                          <FiEye />
                        </a>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PROGRESS FOOTER */}
          <div className="mt-16 p-6 bg-indigo-900 rounded-[2rem] flex flex-col md:flex-row items-center justify-between text-white gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-white/20 flex items-center justify-center font-black">
                {verificationStatus?.completionPercentage || 0}%
              </div>
              <p className="font-bold text-lg">Onboarding Completion</p>
            </div>
            <p className="text-indigo-200 text-sm font-medium">Your account is currently {sellerStatus} and undergoing verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const Section = ({ title, icon: Icon, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-black text-gray-800 tracking-tight uppercase italic">{title}</h3>
    </div>
    {children}
  </div>
);

const EditableField = ({ label, name, value, isEditing, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
    {isEditing ? (
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
      />
    ) : (
      <div className="px-4 py-3 bg-gray-50/50 border border-transparent rounded-xl text-sm font-bold text-gray-700">
        {value || "—"}
      </div>
    )}
  </div>
);

const ReadOnly = ({ label, value }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
    <div className="px-4 py-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl text-sm font-bold text-indigo-900/60">
      {value || "Not Set"}
    </div>
  </div>
);

export default BusinessInfoStep;