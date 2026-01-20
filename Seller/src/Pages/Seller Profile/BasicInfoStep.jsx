import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  FiUser, FiPhone, FiMapPin, FiEdit3, FiSave, FiX, 
  FiMail, FiInfo, FiLock
} from "react-icons/fi";
import { toast } from "react-toastify";

const phoneFields = ["phone", "alternatePhone", "contactPersonPhone"];

const BasicInfoStep = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", alternatePhone: "",
    street: "", city: "", state: "", pincode: "",
    contactPersonName: "", contactPersonDesignation: "",
    contactPersonPhone: "", contactPersonEmail: "",
  });

  useEffect(() => {
    const fetchBasicInfo = async () => {
      try {
        const res = await api.get("/api/seller/profile/basic");
        if (res.data.success) {
          const s = res.data.seller || {};
          setFormData({
            name: s.name ?? "",
            email: s.email ?? "",
            phone: s.phone ?? "",
            alternatePhone: s.alternatePhone ?? "",
            street: s.address?.street ?? "",
            city: s.address?.city ?? "",
            state: s.address?.state ?? "",
            pincode: s.address?.pincode ?? "",
            contactPersonName: s.contactPerson?.name ?? "",
            contactPersonDesignation: s.contactPerson?.designation ?? "",
            contactPersonPhone: s.contactPerson?.phone ?? "",
            contactPersonEmail: s.contactPerson?.email ?? "",
          });
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchBasicInfo();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (phoneFields.includes(name)) {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/api/seller/profile/basic", formData);
      if (res.data.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600" />
          <FiUser className="absolute text-indigo-600 animate-pulse" size={20} />
        </div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Synchronizing Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Profile</h1>
          <p className="text-slate-500 mt-1">Manage your store information and public contact details.</p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold transition-all hover:bg-slate-50 active:scale-95"
              >
                <FiX className="transition-transform group-hover:rotate-90" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
              >
                <FiSave /> Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95"
            >
              <FiEdit3 /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: IDENTITY & CONTACT */}
        <div className="lg:col-span-2 space-y-8">
          <SectionContainer icon={FiUser} title="Seller Identity" color="indigo">
            <Field label="Store Name" name="name" {...{ formData, isEditing, handleChange }} />
            <Field label="Primary Phone" name="phone" {...{ formData, isEditing, handleChange }} />
            <Field label="Registered Email" name="email" disabled {...{ formData, isEditing }} />
            <Field label="Secondary Phone" name="alternatePhone" {...{ formData, isEditing, handleChange }} />
          </SectionContainer>

          <SectionContainer icon={FiMapPin} title="Operational Address" color="purple">
            <div className="col-span-full">
               <Field label="Street / Building / Area" name="street" fullWidth {...{ formData, isEditing, handleChange }} />
            </div>
            <Field label="City" name="city" {...{ formData, isEditing, handleChange }} />
            <Field label="State" name="state" {...{ formData, isEditing, handleChange }} />
            <Field label="Pincode" name="pincode" {...{ formData, isEditing, handleChange }} />
          </SectionContainer>
        </div>

        {/* RIGHT COLUMN: STATUS / TIPS */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FiInfo /> Profile Status
            </h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
              Your profile is visible to customers. Keep your contact details updated to ensure smooth communication.
            </p>
            <div className="h-2 bg-indigo-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[85%] rounded-full" />
            </div>
            <p className="text-[11px] mt-2 text-indigo-200 font-medium">85% Profile Completion</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-4">Security Note</h4>
            <div className="flex items-start gap-3 text-slate-500 text-xs">
              <FiLock className="mt-0.5 text-slate-400" size={16} />
              <p>Sensitive data like your registered email cannot be changed manually for security reasons.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= STYLED SUB-COMPONENTS =================

const SectionContainer = ({ icon: Icon, title, children, color }) => {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-2xl ${themes[color]}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-800">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, name, formData, isEditing, handleChange, disabled, fullWidth }) => {
  const value = formData?.[name] ?? "";

  return (
    <div className={`flex flex-col space-y-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
        {label}
      </label>

      {isEditing && !disabled ? (
        <input
          name={name}
          value={value}
          onChange={handleChange}
          autoComplete="off"
          className="w-full bg-slate-50/50 rounded-2xl border-2 border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none"
        />
      ) : (
        <div className={`group relative w-full rounded-2xl px-4 py-3 text-sm font-semibold border-2 transition-all
          ${disabled 
            ? "bg-slate-50 text-slate-400 border-slate-50 cursor-not-allowed" 
            : "bg-white text-slate-700 border-transparent hover:border-slate-100 hover:bg-slate-50/30"
          }`}>
          {value || <span className="text-slate-300 font-medium italic">Not provided</span>}
          
          {disabled && (
            <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          )}
        </div>
      )}
    </div>
  );
};

export default BasicInfoStep;