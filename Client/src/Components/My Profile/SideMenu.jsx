import React, { useContext } from 'react';
import { Avatar, Button, Divider } from '@mui/material';
import { FaRegUser } from "react-icons/fa";
import { FiHeart, FiSettings } from "react-icons/fi";
import { RiLogoutCircleLine } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/Appcontext.jsx';

function SideMenu() {
  const { profile, logout } = useContext(AppContext);

  // Helper for initials
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden sticky top-24 font-sans">

      {/* 1. Header Profile Section */}
      <div className="w-full px-6 pt-10 pb-6 flex items-center justify-center flex-col text-center bg-gradient-to-b from-slate-50/50 to-white">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full p-1 bg-white ring-2 ring-indigo-100 ring-offset-2">
            <Avatar
              alt={profile?.name || "User"}
              src={profile?.image || null} // Use profile image if available, else fallback to initials
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: '#4f46e5',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(profile?.name)}
            </Avatar>
          </div>
          {/* Active Dot */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
        </div>

        <h2 className="font-bold text-slate-900 text-lg tracking-tight">
          {profile?.name || 'Guest User'}
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">
          {profile?.email || 'guest@example.com'}
        </p>
      </div>

      <div className="px-6 pb-2">
        <Divider sx={{ borderColor: '#e2e8f0' }} />
      </div>

      {/* 2. Navigation List */}
      <nav className="p-4 space-y-1.5">
        <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Account</p>

        <MenuTab to="/myProfile" icon={<FaRegUser />} label="My Profile" />
        <MenuTab to="/orders" icon={<IoBagCheckOutline />} label="My Orders" />
        <MenuTab to="/wishlist" icon={<FiHeart />} label="My Wishlist" />

        <div className="my-2 px-4">
          <Divider sx={{ borderColor: '#e2e8f0' }} />
        </div>

        <div className="pt-1">
          <Button
            onClick={logout}
            className="!flex !px-5 !py-3 !items-center !justify-start !gap-4 !w-full !capitalize !rounded-xl !text-slate-500 hover:!bg-rose-50 hover:!text-rose-600 !transition-all !duration-200 group"
          >
            <RiLogoutCircleLine className="text-[18px] group-hover:rotate-180 transition-transform duration-300" />
            <span className="text-[14px] font-semibold">Sign Out</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

// Reusable Tab Component
const MenuTab = ({ to, icon, label }) => (
  <NavLink to={to} className="block group">
    {({ isActive }) => (
      <Button
        className={`!flex !px-5 !py-3 !items-center !justify-start !gap-4 !w-full !capitalize !rounded-xl !transition-all !duration-200 ${isActive
            ? '!bg-indigo-50 !text-indigo-600 !font-bold'
            : '!text-slate-600 hover:!bg-slate-50 hover:!text-slate-900 !font-medium'
          }`}
      >
        <span className={`text-[18px] ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
          {icon}
        </span>
        <span className="text-[14px]">
          {label}
        </span>
      </Button>
    )}
  </NavLink>
);

export default SideMenu;