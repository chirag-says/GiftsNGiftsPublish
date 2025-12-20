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

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden sticky top-24">
      {/* Header Profile Section */}
      <div className="w-full px-6 pt-8 pb-6 flex items-center justify-center flex-col text-center">
        <div className="relative group mb-3">
          <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-gray-200 group-hover:border-purple-400 transition-colors duration-500">
            <Avatar
              alt={profile?.name || "User"}
              src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-female_0627fd.svg"
              sx={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
        
        <h2 className="font-bold text-gray-800 text-[17px] tracking-tight">
          {profile?.name || 'User Name'}
        </h2>
        <p className="text-[12px] font-medium text-gray-400 mt-0.5">
          {profile?.email || 'member@example.com'}
        </p>
      </div>

      <div className="px-4">
        <Divider sx={{ opacity: 0.6 }} />
      </div>

      {/* Navigation List */}
      <nav className="p-4 space-y-1">
        <MenuTab to="/myProfile" icon={<FaRegUser />} label="My Profile" />
        <MenuTab to="/orders" icon={<IoBagCheckOutline />} label="My Orders" />
        <MenuTab to="/wishlist" icon={<FiHeart />} label="My Wishlist" />
        
        <div className="pt-2">
          <Button 
            onClick={logout} 
            className="!flex !px-5 !py-3 !items-center !justify-start !gap-4 !w-full !capitalize !rounded-2xl !text-gray-500 hover:!bg-red-50 hover:!text-red-500 !transition-all !duration-300"
          >
            <RiLogoutCircleLine className="text-[18px]" /> 
            <span className="text-[14px] font-semibold">Logout</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

// Reusable Tab Component for cleaner code
const MenuTab = ({ to, icon, label }) => (
  <NavLink to={to} className="block group">
    {({ isActive }) => (
      <Button 
        className={`!flex !px-5 !py-3 !items-center !justify-start !gap-4 !w-full !capitalize !rounded-2xl !transition-all !duration-300 ${
          isActive 
          ? '!bg-purple-50 !text-purple-700' 
          : '!text-gray-600 hover:!bg-gray-50 hover:!text-gray-900'
        }`}
      >
        <span className={`text-[18px] transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
          {label}
        </span>
      </Button>
    )}
  </NavLink>
);

export default SideMenu;