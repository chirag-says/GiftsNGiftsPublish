import React, { useContext, useState, useRef, useEffect, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, IconButton, Tooltip, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AppContext } from "../../../context/Appcontext";

// Icons
import { MdOutlineShoppingCart, MdSearch } from "react-icons/md";
import { FiHeart, FiUser, FiLogOut, FiPackage, FiChevronRight } from "react-icons/fi";
import Search from "./Search";
import logo from "../../../../assets/new_gng.png";

// Optimized Styled Component for Badges
const StyledBadge = styled(Badge)({
  "& .MuiBadge-badge": {
    backgroundColor: "#7d0492",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "800",
    height: "18px",
    minWidth: "18px",

    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
});

const Navigation = () => {
  const navigate = useNavigate();
  const { userData, logout, cartItems, wishlistItems } = useContext(AppContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 bg-[#7d0492] w-full z-[1000] shadow-md transition-all duration-300">
      <nav className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4 md:gap-10">

          {/* Logo Section */}
          <Link to="/" className="flex-shrink-0 transition-transform active:scale-95">
            <img
              src={logo}
              alt="Logo"
              className="h-10 md:h-14 w-auto object-contain brightness-110"
            />
          </Link>

          {/* Search Section - Desktop */}
          <div className="hidden md:block flex-grow max-w-2xl">
            <Search />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 md:gap-3">
            <NavIcon
              title="Search"
              icon={<MdSearch />}
              onClick={() => navigate('/search-results')}
              mobileOnly
            />

            <NavIcon
              title="Wishlist"
              icon={<FiHeart />}
              to="/wishlist"
              badgeCount={wishlistItems.length}
              hideMobile
            />

            <NavIcon
              title="Cart"
              icon={<MdOutlineShoppingCart />}
              to="/cartlist"
              badgeCount={cartItems.length}
            />

            {/* Auth / Profile Section */}
            <div className="relative ml-2 border-l border-white/20 pl-3 md:pl-5" ref={userMenuRef}>
              {userData ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-[#7d0492] flex items-center justify-center font-bold text-sm shadow-inner hover:ring-4 hover:ring-white/20 transition-all"
                >
                  {userData.name[0].toUpperCase()}
                </button>
              ) : (
                <Button
                  onClick={() => navigate("/login")}
                  variant="outlined"
                  className="!text-white !border-white/40 !rounded-full !pb-2 !pt-2 !px-5 !text-xs !font-bold hover:!bg-white hover:!text-[#7d0492] !transition-all"
                >
                  Sign In
                </Button>
              )}

              {/* Enhanced Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="pt-4 px-5 bg-gray-50/80 border-b">
                    <p className="text-[10px] text-[#7d0492] font-black uppercase tracking-[0.15em] mb-1">Account</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{userData?.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{userData?.email}</p>
                  </div>

                  <div className="py-2 px-2">
                    <DropdownItem icon={<FiUser />} label="My Profile" to="/myProfile" onClick={() => setUserMenuOpen(false)} />
                    <DropdownItem icon={<FiPackage />} label="Orders" to="/orders" onClick={() => setUserMenuOpen(false)} />
                    <DropdownItem icon={<FiHeart />} label="Wishlist" to="/wishlist" onClick={() => setUserMenuOpen(false)} />

                    <div className="my-2 border-t border-gray-50" />

                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FiLogOut className="text-lg" /> Logout
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="md:hidden mt-3">
          <Search />
        </div>
      </nav>
    </header>
  );
};

// Reusable Nav Icon Component
const NavIcon = ({ icon, title, to, badgeCount, onClick, mobileOnly, hideMobile }) => {
  const content = (
    <IconButton onClick={onClick} className="!text-white hover:!bg-white/10 !transition-colors">
      <StyledBadge badgeContent={badgeCount}>
        {React.cloneElement(icon, { size: 24 })}
      </StyledBadge>
    </IconButton>
  );

  return (
    <div className={`${mobileOnly ? 'md:hidden' : ''} ${hideMobile ? 'hidden sm:block' : ''}`}>
      <Tooltip title={title}>
        {to ? <Link to={to}>{content}</Link> : content}
      </Tooltip>
    </div>
  );
};

// Reusable Dropdown Item Component
const DropdownItem = ({ icon, label, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-[#7d0492] rounded-xl transition-all group"
  >
    <div className="flex items-center gap-3">
      <span className="text-lg text-gray-400 group-hover:text-[#7d0492] transition-colors">{icon}</span>
      {label}
    </div>
    <FiChevronRight className="text-gray-300 group-hover:text-[#7d0492] transition-colors" />
  </Link>
);

export default memo(Navigation);