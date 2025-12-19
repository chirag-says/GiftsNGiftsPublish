import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, IconButton, Tooltip, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AppContext } from "../../../context/Appcontext";

// Icons
import { MdOutlineShoppingCart, MdSearch, MdOutlineHelpOutline } from "react-icons/md";
import { FiHeart, FiUser, FiLogOut, FiPackage, FiTruck } from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";

import Search from "./Search";
import logo from "../../../../assets/new_gng.png";
import NavCategory from "./NavCategry";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#fff", // White badge on purple background
    color: "#7d0492",
    fontSize: "10px",
    fontWeight: "bold",
    height: "18px",
    minWidth: "18px",
  },
}));

function Navigation() {
  const navigate = useNavigate();
  const { userData, logout, cartItems, wishlistItems } = useContext(AppContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="py-4 top-0 bg-[#7d0492] left-0 w-full z-[1000]">
      
      {/* 2. Main Navigation */}
      <nav 
        // className={`transition-all duration-500 bg-[#7d0492] ${
        //   isScrolled ? " shadow-xl py-2" : 'py-2'
        // }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between gap-4 md:gap-10">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <img 
                src={logo} 
                alt="GiftsNGifts Logo" 
                className="h-9 sm:h-11 md:h-14 w-auto object-contain transition-all duration-300 brightness-110" 
              />
            </Link>
          </div>

          {/* Search Section */}
          <div className="hidden md:block flex-grow max-w-2xl">
            <Search />
          </div>

          {/* Action Icons Zone */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Mobile Search Icon */}
            <div className="md:hidden">
              <IconButton onClick={() => navigate('/search-results')} className="text-white hover:bg-white/10">
                <MdSearch className="text-2xl" />
              </IconButton>
            </div>

            {/* Wishlist */}
            <Tooltip title="Wishlist">
              <Link to="/wishlist" className="hidden sm:block">
                <IconButton className="!text-white hover:bg-white/10">
                  <StyledBadge badgeContent={wishlistItems.length}>
                    <FiHeart className="text-[22px]" />
                  </StyledBadge>
                </IconButton>
              </Link>
            </Tooltip>

            {/* Cart */}
            <Tooltip title="Cart">
              <Link to="/cartlist">
                <IconButton className="!text-white hover:bg-white/10">
                  <StyledBadge badgeContent={cartItems.length}>
                    <MdOutlineShoppingCart className="text-[24px]" />
                  </StyledBadge>
                </IconButton>
              </Link>
            </Tooltip>

            {/* User Profile / Login */}
            <div className="relative ml-1 md:ml-2 border-l border-white/20 pl-3 md:pl-4" ref={userMenuRef}>
              {userData ? (
                <div 
                  className="w-9 h-9 flex justify-center items-center rounded-full bg-white text-[#7d0492] cursor-pointer hover:scale-105 transition-all font-bold text-sm shadow-md"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {userData.name[0].toUpperCase()}
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/login")}
                  variant="outlined"
                  className="!text-white !border-white/50  !capitalize !font-semibold !px-6 !rounded-full py-2 hover:!bg-white hover:!text-[#7d0492] transition-all"
                >
                  <span className="text-[14px]">Sign In</span>
                </Button>
              )}

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-4 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800">
                  <div className="p-4 bg-gray-50 border-b">
                    <p className="text-[10px] text-[#7d0492] font-bold uppercase tracking-widest mb-1">Welcome back</p>
                    <p className="text-sm font-bold truncate">{userData?.name}</p>
                  </div>
                  <div className="py-2">
                    <DropdownLink to="/myProfile" icon={<FiUser />} label="Profile Settings" onClick={() => setUserMenuOpen(false)} />
                    <DropdownLink to="/orders" icon={<FiPackage />} label="Order History" onClick={() => setUserMenuOpen(false)} />
                    <DropdownLink to="/wishlist" icon={<FiHeart />} label="My Wishlist" onClick={() => setUserMenuOpen(false)} />
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="text-lg" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden px-4 mt-3 pb-1">
          <Search />
        </div>
      </nav>
    </header>
  );
}

const DropdownLink = ({ to, icon, label, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-purple-50 hover:text-[#7d0492] transition-all font-medium"
  >
    <span className="text-lg opacity-70">{icon}</span>
    {label}
  </Link>
);

export default Navigation;