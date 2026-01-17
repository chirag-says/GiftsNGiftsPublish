import React, { useContext, useState } from "react";
import { PiSignOutBold } from "react-icons/pi";
import { FaGift, FaChevronDown } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io";
import { LuSettings, LuUser } from "react-icons/lu"; // Added for better menu icons
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Divider, IconButton, Badge } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Admincontext } from "../context/admincontext";

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { isAuthenticated, logout } = useContext(Admincontext);
  const navigate = useNavigate();
  const name = localStorage.getItem("adminName") || "Admin";

  const handleClick = (event) => {
    if (isAuthenticated) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-[80px] sm:h-[85px] flex items-center justify-between">
        
        {/* --- Left: Logo Section --- */}
        <Link to="/" className="flex pl-20 sm:pl-80 items-center gap-2.5 group no-underline">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg group-hover:rotate-6 transition-transform duration-300">
            <FaGift className="text-lg sm:text-xl" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              GiftNGifts
            </span>
          </div>
        </Link>

        {/* --- Right: Actions Section --- */}
        {isAuthenticated && (
          <div className="flex items-center gap-1 sm:gap-4">
            
            {/* Notification Bell */}
            <IconButton 
              className="!text-gray-500 hover:!bg-gray-100/50 !transition-all active:!scale-90"
              size="large"
            >
              <Badge 
                overlap="circular"
                badgeContent="" 
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#ef4444",
                    boxShadow: "0 0 0 2px #fff"
                  }
                }}
              >
                <IoMdNotificationsOutline size={22} />
              </Badge>
            </IconButton>

            <Divider orientation="vertical" flexItem className="!hidden sm:!block !mx-2 !h-8 !self-center !border-gray-200" />

            {/* User Profile Trigger */}
            <button
              onClick={handleClick}
              className={`flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 sm:pr-4 rounded-2xl transition-all duration-200 border border-transparent outline-none
                ${open ? 'bg-gray-100/80 border-gray-200 shadow-inner' : 'hover:bg-gray-50 hover:border-gray-200'}`}
            >
              {/* Avatar with dynamic initials */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-100">
                {name[0]?.toUpperCase()}
              </div>

              {/* Text - Hidden on ultra small screens */}
              <div className="hidden xs:flex flex-col items-start">
                <span className="text-xs sm:text-sm font-bold text-gray-800 leading-none">
                  {name}
                </span>
                <span className="text-[10px] font-semibold text-indigo-500/80 mt-1 uppercase">
                  Root
                </span>
              </div>

              <FaChevronDown className={`text-gray-400 text-[10px] transition-transform duration-300 ${open ? 'rotate-180' : ''} hidden sm:block`} />
            </button>
          </div>
        )}

        {/* --- Dropdown Menu --- */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          disableScrollLock={true}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.1))",
                mt: 1.5,
                borderRadius: "20px",
                border: "1px solid #f1f5f9",
                minWidth: "240px",
                padding: "8px",
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 28,
                  width: 12,
                  height: 12,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                  borderTop: "1px solid #f1f5f9",
                  borderLeft: "1px solid #f1f5f9",
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <div className="px-4 py-3 mb-2 bg-slate-50 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Account Status</p>
            <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
          </div>

          <MenuItem
            component={Link}
            to="/account-settings"
            className="!py-2.5 !px-4 !text-slate-600 hover:!bg-indigo-50 hover:!text-indigo-600 !rounded-xl !transition-all !mb-1"
          >
            <LuUser className="mr-3 text-lg opacity-70" />
            <span className="text-sm font-bold">My Profile</span>
          </MenuItem>

          <MenuItem
            component={Link}
            to="/settings"
            className="!py-2.5 !px-4 !text-slate-600 hover:!bg-indigo-50 hover:!text-indigo-600 !rounded-xl !transition-all"
          >
            <LuSettings className="mr-3 text-lg opacity-70" />
            <span className="text-sm font-bold">Preferences</span>
          </MenuItem>

          <Divider className="!my-2 !opacity-50" />

          <MenuItem
            onClick={handleLogout}
            className="!py-3 !px-4 !text-rose-500 hover:!bg-rose-50 hover:!text-rose-600 !rounded-xl !transition-all"
          >
            <PiSignOutBold className="mr-3 text-lg" />
            <span className="text-sm font-black uppercase tracking-wider">Sign Out</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

export default Header;