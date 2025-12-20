import React, { useContext, useState, useEffect } from "react";
import { TextField, Button, Paper } from "@mui/material";
import axios from "axios";
import SideMenu from "./SideMenu.jsx";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext.jsx";
import { FiEdit2, FiUser, FiPhone, FiMail, FiCheckCircle } from "react-icons/fi";

function Myprofile() {
  const { profile, setProfile, backendurl } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const token = localStorage.getItem("token") || null;

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const handleChange = (e) => {
    setLocalProfile({ ...localProfile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/updateprofile`,
        localProfile,
        { headers: { token } }
      );
      if (data.message) {
        toast.success(data.message);
        setEditing(false);
        setProfile(localProfile);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving profile");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-6 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          
          {/* Side Menu Section - Hidden on small mobile or stacked */}
          <div className="lg:w-1/4 w-full order-2 lg:order-1">
            <SideMenu />
          </div>

          {/* Profile Content Section */}
          <div className="lg:w-3/4 w-full order-1 lg:order-2 space-y-6">
            <Paper 
              elevation={0} 
              className="!rounded-3xl border border-gray-100 overflow-hidden bg-white shadow-sm"
            >
              <div className="p-6 md:p-10">
                {/* Header: Responsive flex direction */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Update your personal details and contact info</p>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all duration-300 active:scale-95"
                    >
                      <FiEdit2 /> Edit Profile
                    </button>
                  )}
                </div>

                {!editing ? (
                  /* Display Grid: 1 col on mobile, 3 on desktop */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <ProfileInfoItem icon={<FiUser className="text-purple-500"/>} label="Full Name" value={profile?.name} />
                    <ProfileInfoItem icon={<FiPhone className="text-blue-500"/>} label="Phone Number" value={profile?.phone} />
                    <ProfileInfoItem icon={<FiMail className="text-orange-500"/>} label="Email Address" value={profile?.email} />
                  </div>
                ) : (
                  /* Form Grid: Optimized for touch and spacing */
                  <form className="animate-in fade-in slide-in-from-top-2 duration-400" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Full Name</label>
                        <TextField
                          fullWidth
                          name="name"
                          value={localProfile?.name || ""}
                          onChange={handleChange}
                          variant="outlined"
                          required
                          placeholder="John Doe"
                          sx={inputStyles}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Phone Number</label>
                        <TextField
                          fullWidth
                          name="phone"
                          value={localProfile?.phone || ""}
                          onChange={handleChange}
                          variant="outlined"
                          required
                          placeholder="+1 234 567 890"
                          sx={inputStyles}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mb-10">
                        <label className="text-[11px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Email Address</label>
                        <TextField
                          fullWidth
                          name="email"
                          value={localProfile?.email || ""}
                          onChange={handleChange}
                          variant="outlined"
                          required
                          sx={inputStyles}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="submit"
                        variant="contained"
                        className="!bg-purple-700 !rounded-2xl !px-10 !py-3.5 !normal-case !font-bold !shadow-none hover:!bg-purple-800 transition-all w-full sm:w-auto"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        className="!text-gray-500 !bg-gray-100 !rounded-2xl !px-8 !py-3.5 !normal-case !font-bold hover:!bg-gray-200 transition-all w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Paper>

            {/* Verification/Status Card (Bonus modern touch) */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <FiCheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">Account Verified</h3>
                    <p className="text-white/80 text-xs">Your account is secure and information is encrypted.</p>
                  </div>
               </div>
               {/* <button className="px-5 py-2 bg-white text-purple-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">
                 Privacy Settings
               </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileInfoItem = ({ icon, label, value }) => (
  <div className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-purple-50 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-gray-900 font-bold truncate text-[15px]">{value || "Not provided"}</p>
  </div>
);

// Custom MUI input styling to match modern UI
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#a855f7' },
    '&.Mui-focused fieldset': { borderColor: '#7d0492' },
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: 500
  }
};

export default Myprofile;