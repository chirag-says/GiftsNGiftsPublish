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

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9]  py-8 md:py-12 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Side Menu */}
          <div className="lg:w-1/4 w-full order-2 lg:order-1">
            <SideMenu />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 w-full order-1 lg:order-2 space-y-6">

            <Paper
              elevation={0}
              className="!rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-sm"
            >
              <div className="p-6 md:p-10">

                {/* Header with Avatar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-stone-100">
                  <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer">
                      <Avatar
                        sx={{
                          width: 85,
                          height: 85,
                          bgcolor: '#1a3a32', // Deep Forest Green from Logo
                          fontSize: '2rem',
                          fontWeight: '500',
                          border: '4px solid #fdfbf7',
                          boxShadow: '0 4px 10px rgba(26, 58, 50, 0.15)'
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
                      <h1 className="text-2xl font-serif font-bold text-[#1a3a32]">{profile?.name || 'User Profile'}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-bold uppercase tracking-wider">
                          Heritage Member
                        </span>
                        <p className="text-stone-500 text-sm italic">Member since 2025</p>
                      </div>
                    </div>
                  </div>

                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#1a3a32] bg-[#fdfbf7] border border-[#1a3a32]/20 hover:bg-[#1a3a32] hover:text-white rounded-lg transition-all duration-300"
                    >
                      <FiEdit2 /> Edit Profile
                    </button>
                  )}
                </div>

                {/* Content Area */}
                {!editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProfileInfoItem
                      icon={<FiUser className="text-[#c5a059]" />} // Muted Gold from "Shop Now" button
                      label="Full Name"
                      value={profile?.name}
                    />
                    <ProfileInfoItem
                      icon={<FiPhone className="text-[#c5a059]" />}
                      label="Phone Number"
                      value={profile?.phone}
                    />
                    <ProfileInfoItem
                      icon={<FiMail className="text-[#c5a059]" />}
                      label="Email Address"
                      value={profile?.email}
                    />
                  </div>
                ) : (
                  <form className="animate-in fade-in slide-in-from-top-2 duration-300" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-stone-500 ml-1">Full Name</label>
                        <TextField
                          fullWidth
                          name="name"
                          value={localProfile?.name || ""}
                          onChange={handleChange}
                          variant="outlined"
                          required
                          sx={inputStyles}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-stone-500 ml-1">Phone Number</label>
                        <TextField
                          fullWidth
                          name="phone"
                          value={localProfile?.phone || ""}
                          onChange={handleChange}
                          variant="outlined"
                          required
                          sx={inputStyles}
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold uppercase text-stone-500 ml-1">Email Address</label>
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
                    </div>

                    <div className="flex items-center gap-4 border-t border-stone-100 pt-6">
                      <Button
                        type="submit"
                        variant="contained"
                        className="!bg-[#c5a059] !rounded-lg !px-8 !py-3 !normal-case !font-bold !shadow-none hover:!bg-[#1a3a32] transition-all"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        className="!text-stone-500 !bg-transparent hover:!bg-stone-50 !rounded-lg !px-6 !py-3 !normal-case !font-semibold transition-all"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Paper>

            {/* Status Card */}
            <div className="bg-[#1a3a32] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-3 bg-[#c5a059]/20 rounded-xl border border-[#c5a059]/30">
                  <FiCheckCircle className="text-[#c5a059]" size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg mb-1">Authenticity Guaranteed</h3>
                  <p className="text-stone-300 text-sm leading-relaxed max-w-md">
                    Your profile is secure. We value the privacy of our patrons as much as the heritage of our crafts.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileInfoItem = ({ icon, label, value }) => (
  <div className="p-5 rounded-xl bg-[#fdfbf7] border border-stone-100 hover:border-[#c5a059]/30 hover:bg-white transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div className="text-lg">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-[#1a3a32] font-bold truncate text-[15px] pl-1">{value || "Not provided"}</p>
  </div>
);

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    '& fieldset': {
      borderColor: '#e5e7eb',
    },
    '&:hover fieldset': {
      borderColor: '#c5a059',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a3a32',
      borderWidth: '1px'
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    fontSize: '15px',
    color: '#1a3a32',
  }
};

export default Myprofile;