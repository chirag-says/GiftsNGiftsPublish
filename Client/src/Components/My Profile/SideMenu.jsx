import React, { useContext } from 'react';
import { Avatar, Button, Divider } from '@mui/material';
import { FaRegUser } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { RiLogoutCircleLine } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/Appcontext.jsx';

function SideMenu() {
  const { profile, logout } = useContext(AppContext);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden sticky top-24 font-sans">

      {/* Profile Header */}
      <div className="w-full px-6 pt-10 pb-6 flex items-center justify-center flex-col text-center bg-[#fdfbf7]">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full p-1 bg-white ring-2 ring-[#c5a059]/30">
            <Avatar
              alt={profile?.name || "User"}
              src={profile?.image || null}
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: '#1a3a32',
                fontSize: '1.4rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(profile?.name)}
            </Avatar>
          </div>
        </div>

        <h2 className="font-serif font-bold text-[#1a3a32] text-lg">
          {profile?.name || 'Guest Patron'}
        </h2>
        <p className="text-[11px] font-medium text-stone-400 mt-1 uppercase tracking-widest">
          {profile?.email || 'guest@giftsngifts.in'}
        </p>
      </div>

      <nav className="p-4 space-y-1">
        <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 mt-2">Account Management</p>

        <MenuTab to="/myProfile" icon={<FaRegUser />} label="My Profile" />
        <MenuTab to="/orders" icon={<IoBagCheckOutline />} label="My Orders" />
        <MenuTab to="/wishlist" icon={<FiHeart />} label="My Wishlist" />

        <div className="my-4 px-4">
          <Divider sx={{ borderColor: '#f3f4f6' }} />
        </div>

        <Button
          onClick={logout}
          className="!flex !px-5 !py-3 !items-center !justify-start !gap-4 !w-full !capitalize !rounded-lg !text-stone-500 hover:!bg-red-50 hover:!text-red-600 !transition-all"
        >
          <RiLogoutCircleLine className="text-[18px]" />
          <span className="text-[14px] font-semibold">Sign Out</span>
        </Button>
      </nav>
    </div>
  );
}

const MenuTab = ({ to, icon, label }) => (
  <NavLink to={to} className="block group">
    {({ isActive }) => (
      <Button
        className={`!flex !px-5 !py-3 !items-center !justify-start !gap-4 !w-full !capitalize !rounded-lg !transition-all ${
          isActive
            ? '!bg-[#1a3a32] !text-white !shadow-md'
            : '!text-stone-600 hover:!bg-[#fdfbf7] hover:!text-[#1a3a32]'
        }`}
      >
        <span className={`text-[17px] ${isActive ? 'text-[#c5a059]' : 'text-stone-400 group-hover:text-[#1a3a32]'}`}>
          {icon}
        </span>
        <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-medium'}`}>
          {label}
        </span>
      </Button>
    )}
  </NavLink>
);

export default SideMenu;