import React, { useContext, useState, useEffect } from "react";
import { TextField, Button, Paper, Avatar } from "@mui/material";
import api from "../../utils/api";
import SideMenu from "./SideMenu.jsx";
import { toast } from "react-toastify";
import { AppContext } from "../context/Appcontext.jsx";
import {
  FiEdit2,
  FiUser,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiShield,
  FiCamera
} from "react-icons/fi";

function Myprofile() {
  const { profile, setProfile } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile || {});

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const handleChange = (e) => {
    setLocalProfile({ ...localProfile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/user/updateprofile', localProfile);
      if (data.message) {
        toast.success(data.message);
        setEditing(false);
        setProfile(localProfile);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving profile");
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Side Menu */}
          <div className="lg:w-1/4 w-full order-2 lg:order-1">
            <SideMenu />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 w-full order-1 lg:order-2 space-y-6">

            {/* Main Profile Card */}
            <Paper
              elevation={0}
              className="!rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm"
            >
              <div className="p-6 md:p-10">

                {/* Header with Avatar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer">
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#4f46e5',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
                        }}
                      >
                        {getInitials(profile?.name)}
                      </Avatar>
                      {editing && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiCamera className="text-white text-xl" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{profile?.name || 'User Profile'}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                          Active Customer
                        </span>
                        <p className="text-slate-500 text-sm">Member since 2025</p>
                      </div>
                    </div>
                  </div>

                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200"
                    >
                      <FiEdit2 /> Edit Profile
                    </button>
                  )}
                </div>

                {/* Content Area */}
                {!editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProfileInfoItem
                      icon={<FiUser className="text-indigo-600" />}
                      label="Full Name"
                      value={profile?.name}
                    />
                    <ProfileInfoItem
                      icon={<FiPhone className="text-blue-500" />}
                      label="Phone Number"
                      value={profile?.phone}
                    />
                    <ProfileInfoItem
                      icon={<FiMail className="text-rose-500" />}
                      label="Email Address"
                      value={profile?.email}
                    />
                  </div>
                ) : (
                  <form className="animate-in fade-in slide-in-from-top-2 duration-300" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Full Name</label>
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

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Phone Number</label>
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

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase text-slate-500 ml-1">Email Address</label>
                        <TextField
                          fullWidth
                          name="email"
                          value={localProfile?.email || ""}
                          onChange={handleChange}
                          variant="outlined"
                          required
                          sx={inputStyles}
                        />
                        <p className="text-[11px] text-slate-400 ml-1 flex items-center gap-1">
                          <FiShield size={10} /> This email is linked to your login credentials.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                      <Button
                        type="submit"
                        variant="contained"
                        className="!bg-indigo-600 !rounded-xl !px-8 !py-3 !normal-case !font-semibold !shadow-lg !shadow-indigo-200 hover:!bg-indigo-700 hover:!shadow-indigo-300 transition-all"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        className="!text-slate-500 !bg-transparent hover:!bg-slate-50 !rounded-xl !px-6 !py-3 !normal-case !font-semibold transition-all"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Paper>

            {/* Security/Status Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-200 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                  <FiCheckCircle className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Identity Verified</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                    Your personal information is encrypted and secured with industry-standard protocols.
                  </p>
                </div>
              </div>
              {/* Optional Action */}
              {/* <div className="text-right">
                  <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    ID: {profile?._id?.slice(-8).toUpperCase()}
                  </span>
              </div> */}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for display mode
const ProfileInfoItem = ({ icon, label, value }) => (
  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 bg-white rounded-lg shadow-sm text-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-slate-900 font-semibold truncate text-[15px] pl-1">{value || "Not provided"}</p>
  </div>
);

// Custom MUI Styles aligned with "Professional Indigo" theme
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: '#e2e8f0',
      borderWidth: '1px'
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4f46e5',
      borderWidth: '2px'
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.1)'
    }
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    fontSize: '15px',
    color: '#1e293b',
    fontWeight: 500
  }
};

export default Myprofile;