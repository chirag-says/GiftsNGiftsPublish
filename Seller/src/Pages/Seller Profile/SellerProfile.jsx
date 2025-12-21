import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { FaUserEdit, FaMapMarkerAlt, FaEnvelope, FaPhone, FaUpload, FaTimes, FaPhoneSquareAlt } from "react-icons/fa";
import { RiStore2Fill } from "react-icons/ri";

function SellerProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);



  const getProfile = async () => {
    try {
      const { data } = await api.get("/api/seller/profile");

      if (data.success) {
        setProfile(data.seller);
        setImagePreview(null);
        setImageFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch profile data.");
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e) => {
    const currentAddress = profile.address || {};
    setProfile((prev) => ({
      ...prev,
      address: { ...currentAddress, [e.target.name]: e.target.value },
    }));
  };

  const handleCancelClick = () => {
    setEditing(false);
    getProfile();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("phone", profile.phone || "");
    formData.append("email", profile.email);

    // --- ADDED: Alternate Phone ---
    formData.append("alternatePhone", profile.alternatePhone || "");

    const address = profile.address || {};
    formData.append("street", address.street || "");
    formData.append("city", address.city || "");
    formData.append("state", address.state || "");
    formData.append("pincode", address.pincode || "");

    if (imageFile) formData.append("image", imageFile);

    try {
      const { data } = await api.post(
        "/api/seller/updateprofile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setEditing(false);
        getProfile();
      } else {
        toast.error(data.message || "Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during profile update.");
    }
  };

  // Helper Component for Display
  const ProfileField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start text-gray-700">
      <Icon className="w-5 h-5 mr-3 mt-1 text-indigo-500 flex-shrink-0" />
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
        <p className="text-base font-medium text-gray-800 break-words">{value || 'N/A'}</p>
      </div>
    </div>
  );

  // Helper Component for Inputs
  const CustomInput = ({ name, label, value, onChange, type = "text", required = false, disabled = false }) => (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`block w-full rounded-lg border py-2.5 px-4 text-gray-900 shadow-sm transition duration-150 sm:text-sm ${disabled
          ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50'
          }`}
      />
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-lg max-w-4xl mx-auto mt-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p className="ml-3 text-gray-600">Loading Profile...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-6 space-y-8 bg-gray-50">

      {/* PROFILE CARD - VIEW MODE */}
      <div className="bg-white rounded shadow-2xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-100 to-blue-100 border-b border-indigo-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={profile.image || "https://via.placeholder.com/120?text=Seller"}
                alt="Seller Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-indigo-300"
              />
              <span className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-white ring-2 ring-white">
                <RiStore2Fill className="w-4 h-4" />
              </span>
            </div>

            <div className="text-center sm:text-left pt-2">
              <h2 className="text-3xl font-extrabold text-gray-900">{profile.name}</h2>
              {profile.uniqueId && (
                <div className="mt-2 inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md">
                  <span>Seller ID:</span>
                  <span className="font-mono tracking-wider">{profile.uniqueId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(profile.uniqueId);
                      toast.success("Seller ID copied!");
                    }}
                    className="ml-1 p-1 hover:bg-indigo-500 rounded transition"
                    title="Copy Seller ID"
                  >
                    📋
                  </button>
                </div>
              )}
              <p className="text-lg text-indigo-700 mt-2 font-medium">Verified Seller Account</p>
              <p className="text-sm text-gray-600 mt-1">
                Joined: <span className="font-semibold">{new Date(profile.date).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 grid md:grid-cols-2 gap-8 bg-white">
          <ProfileField icon={FaEnvelope} label="Email Address" value={profile.email} />

          {/* Phone Numbers Section */}
          <ProfileField icon={FaPhone} label="Primary Phone" value={profile.phone} />
          <ProfileField icon={FaPhoneSquareAlt} label="Alternate Phone" value={profile.alternatePhone} />

          <div className="md:col-span-2">
            <ProfileField
              icon={FaMapMarkerAlt}
              label="Registered Address"
              value={profile.address ?
                `${profile.address.street || ''}${profile.address.street ? ', ' : ''}${profile.address.city || ''}${profile.address.city ? ', ' : ''}${profile.address.state || ''}${profile.address.state ? ' - ' : ''}${profile.address.pincode || ''}`.replace(/,\s*-/g, '').trim().replace(/,\s*$/, '').trim()
                : "Address not set."
              }
            />
          </div>

          <div className="md:col-span-2 mt-4 flex justify-end">
            <button
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 ease-in-out transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-indigo-300"
              onClick={() => setEditing(true)}
            >
              <FaUserEdit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* EDIT FORM - EDIT MODE */}
      {editing && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCancelClick}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
              aria-label="Close form"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="-mt-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3 text-indigo-600">
              <FaUserEdit className="inline w-6 h-6 mr-2 mb-1" />
              Update Profile Details
            </h3>

            {/* IMAGE UPLOAD */}
            <div className="mb-8 border border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/70">
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaUpload className="w-5 h-5 mr-3 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {imagePreview ? 'New image selected' : 'Click to upload a new profile image'}
                    </span>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {(imagePreview || profile.image) && (
                    <img
                      src={imagePreview || profile.image}
                      alt="Current Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                  )}
                </div>
              </label>
            </div>

            {/* NAME & EMAIL */}
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <CustomInput
                name="name"
                label="Full Name"
                value={profile.name}
                onChange={handleChange}
                required
              />
              <CustomInput
                name="email"
                label="Email Address"
                value={profile.email}
                onChange={handleChange}
                disabled
              />
            </div>

            {/* PHONE NUMBERS (New Alternate Field Added Here) */}
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <CustomInput
                name="phone"
                label="Primary Phone Number"
                value={profile.phone || ""}
                onChange={handleChange}
                type="tel"
              />
              {/* --- NEW FIELD --- */}
              <CustomInput
                name="alternatePhone"
                label="Alternate Phone Number"
                value={profile.alternatePhone || ""}
                onChange={handleChange}
                type="tel"
              />
            </div>

            {/* ADDRESS SECTION */}
            <h4 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 mr-2 text-indigo-500" /> Shipping Address
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              <CustomInput
                name="street"
                label="Street/Area"
                value={profile.address?.street || ""}
                onChange={handleAddressChange}
              />
              <CustomInput
                name="city"
                label="City"
                value={profile.address?.city || ""}
                onChange={handleAddressChange}
              />
              <CustomInput
                name="state"
                label="State"
                value={profile.address?.state || ""}
                onChange={handleAddressChange}
              />
              <CustomInput
                name="pincode"
                label="Pincode"
                value={profile.address?.pincode || ""}
                onChange={handleAddressChange}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-center gap-6 mt-10">
              <button
                type="button"
                onClick={handleCancelClick}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-10 py-3 bg-emerald-500 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-600 transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-300"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SellerProfile;