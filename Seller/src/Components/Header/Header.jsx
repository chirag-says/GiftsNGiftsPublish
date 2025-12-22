import React, { useContext, useEffect, useState } from "react";
import { FiUser, FiLogOut, FiBell, FiSearch } from "react-icons/fi";
import { LuGift } from "react-icons/lu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Divider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Admincontext } from "../context/admincontext";
import api from "../../utils/api";

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { atoken, setatoken, isAuthenticated, logout } = useContext(Admincontext);
  const navigate = useNavigate();
  const [sellerProfile, setSellerProfile] = useState({ name: "", nickName: "" });
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationOpen = Boolean(notificationAnchorEl);

  // Use isAuthenticated from context instead of checking token manually
  const displayName = sellerProfile.nickName || sellerProfile.name || "Seller";

  useEffect(() => {
    if (!isAuthenticated) {
      setSellerProfile({ name: "", nickName: "" });
      return;
    }

    let ignore = false;
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/seller/profile");
        if (!ignore && data.success) {
          setSellerProfile({
            name: data.seller?.name || "",
            nickName: data.seller?.nickName || ""
          });
        }
      } catch (error) {
        console.error("Failed to load seller profile", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/api/seller/notifications");
        if (!ignore && data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.stats.unread);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchProfile();
    fetchNotifications();

    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleClick = (event) => {
    if (isAuthenticated) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const markAsRead = async (notification) => {
    if (notification.isRead) return;
    
    try {
      const { data } = await api.put(`/api/seller/notifications/${notification._id}/read`);
      if (data.success) {
        setNotifications(prev => prev.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1600px] py-3 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Centered with space for sidebar toggle */}
          <div className="flex items-center justify-center flex-1 pl-12">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 
                            rounded-xl flex items-center justify-center
                            group-hover:shadow-lg group-hover:shadow-indigo-500/25 
                            transition-all duration-300">
                <LuGift className="text-white text-lg" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  GiftNGifts
                </h1>
                <p className="text-[10px] text-gray-400 font-medium -mt-0.5 tracking-wide">
                  SELLER PORTAL
                </p>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 
                             rounded-xl transition-all duration-200 hidden sm:flex">
              <FiSearch className="text-lg" />
            </button>

            {/* Notifications */}
            <button 
              onClick={handleNotificationClick}
              className="relative p-2.5 text-gray-500 hover:text-gray-700 
                             hover:bg-gray-100 rounded-xl transition-all duration-200">
              <FiBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full 
                             ring-2 ring-white" />
              )}
            </button>

            <Menu
              anchorEl={notificationAnchorEl}
              open={notificationOpen}
              onClose={handleNotificationClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  width: 320,
                  maxHeight: 400,
                  overflowY: 'auto',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <div className="px-4 py-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <MenuItem 
                    key={notification._id} 
                    onClick={() => markAsRead(notification)}
                    className={`!whitespace-normal !py-3 border-b border-gray-50 ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium ${!notification.isRead ? 'text-blue-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </MenuItem>
                ))
              )}
            </Menu>

            {/* Profile Dropdown */}
            {isAuthenticated && (
              <button
                onClick={handleClick}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-full 
                         bg-gray-50 hover:bg-gray-100 border border-gray-100
                         transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 
                              text-white font-semibold rounded-full 
                              flex items-center justify-center text-sm
                              group-hover:shadow-md transition-shadow">
                  {displayName[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {displayName}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.08))",
              mt: 1.5,
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.05)",
              minWidth: "220px",
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 20,
                width: 12,
                height: 12,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderTop: "1px solid rgba(0,0,0,0.05)",
                borderLeft: "1px solid rgba(0,0,0,0.05)",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 
                          text-white rounded-full flex items-center justify-center 
                          text-lg font-semibold">
              {displayName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">Seller Account</p>
            </div>
          </div>
        </div>

        <Divider className="!my-2" />

        <Link to="/seller-profile">
          <MenuItem className="!mx-2 !rounded-lg !py-2.5 hover:!bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-gray-600 text-sm" />
              </div>
              <span className="text-sm font-medium text-gray-700">My Profile</span>
            </div>
          </MenuItem>
        </Link>

        <MenuItem
          onClick={handleLogout}
          className="!mx-2 !rounded-lg !py-2.5 hover:!bg-red-50 !mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <FiLogOut className="text-red-500 text-sm" />
            </div>
            <span className="text-sm font-medium text-red-600">Sign Out</span>
          </div>
        </MenuItem>
      </Menu>
    </header>
  );
}

export default Header;