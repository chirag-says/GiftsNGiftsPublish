import React, { useContext, useState, useRef, useEffect, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Badge, IconButton, Tooltip, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { AppContext } from "../../../context/Appcontext";

// Icons
import { MdOutlineShoppingCart, MdSearch } from "react-icons/md";
import { FiHeart, FiUser, FiLogOut, FiPackage, FiChevronRight, FiX } from "react-icons/fi";
import Search from "./Search";
import NavCategory from "./NavCategry.jsx";
import logo from "../../../../assets/roshni/main logo.png";

const StyledBadge = styled(Badge)({
  "& .MuiBadge-badge": {
    backgroundColor: "#C5A059",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "900",
    border: "2px solid #fff",
  },
});

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, logout, cartItems, wishlistItems } = useContext(AppContext);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef(null);

  // Scroll logic for premium background transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ${scrolled ? 'translate-y-0' : 'translate-y-0'}`}>
        {/* Top Accent Line */}
        <div className="h-[2px] bg-gradient-to-r from-[#0F3D2E] via-[#C5A059] to-[#0F3D2E]" />

        <div className={`transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white border-b border-gray-50"}`}>
          <nav className="container mx-auto ">
            <div className="flex items-center justify-between">

              {/* Left: Mobile Toggle & Desktop Search Trigger (Optional) */}
              <div className="flex-1 flex items-center lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="relative w-10 h-10 flex flex-col justify-center items-center group"
                >
                  <span className={`block w-6 h-0.5 bg-[#0F3D2E] transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
                  <span className={`block w-6 h-0.5 bg-[#0F3D2E] my-0.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`block w-6 h-0.5 bg-[#0F3D2E] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
                </button>
              </div>

              {/* Center/Left: Logo */}
              <Link to="/" className="flex-shrink-0 lg:mr-20">
                <img src={logo} alt="GiftsnGifts" className="h-10 md:h-22 w-auto object-contain transition-transform hover:scale-105 duration-300" />
              </Link>

              {/* Center Desktop: Search Bar */}
              <div className="hidden lg:block flex-[2] max-w-3xl ">
                <Search />
              </div>

              {/* Right: Actions */}
              <div className="flex-1 pl-5 flex items-center justify-end gap-1 md:gap-5">
                <div className="lg:hidden">
                  <IconButton onClick={() => navigate('/search-results')} className="!text-[#0F3D2E]"><MdSearch size={26} /></IconButton>
                </div>

                <NavIcon title="Wishlist" icon={<FiHeart />} to="/wishlist" badgeCount={wishlistItems.length} hideMobile />

                <NavIcon title="Cart" icon={<MdOutlineShoppingCart />} to="/cartlist" badgeCount={cartItems.length} />

                {/* Profile Section */}
                <div className="relative ml-2 pl-4 border-l border-gray-100 hidden sm:block" ref={userMenuRef}>
                  {userData ? (
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-10 h-10 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm border-2 border-white ring-1 ring-gray-100 shadow-md hover:ring-[#C5A059] transition-all duration-300"
                    >
                      {userData.name[0].toUpperCase()}
                    </button>
                  ) : (
                    <Button
                      onClick={() => navigate("/login")}
                      variant="contained"
                      className="!bg-[#0F3D2E] !text-white !rounded-full !px-6 !py-2.5 !text-[11px] !font-black !tracking-widest !normal-case hover:!bg-[#C5A059] !transition-all shadow-none"
                    >
                      SIGN IN
                    </Button>
                  )}

                  {/* Desktop Profile Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-4 w-72 bg-white rounded-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
                      <div className="p-6 bg-[#0F3D2E] text-white">
                        <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest mb-1">{userData?.email}</p>
                        <p className="text-lg font-serif truncate ">{userData?.name}</p>
                      </div>
                      <div className="p-3">
                        <DropdownItem icon={<FiUser />} label="My Profile" to="/myProfile" />
                        <DropdownItem icon={<FiPackage />} label="My Orders" to="/orders" />
                        <div className="my-2 border-t border-gray-50" />
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-4 px-5 py-4 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          <FiLogOut size={18} /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Secondary Nav: Categories (Hidden on Scroll or Mobile) */}
          <div className={`hidden lg:block transition-all duration-300 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'}`}>
            <NavCategory />
          </div>
        </div>
      </header>

      {/* --- MOBILE HERITAGE DRAWER --- */}
      <div className={`fixed inset-0 z-[1100] transition-visibility duration-500 ${mobileMenuOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Content */}
        <div className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out p-6 flex flex-col ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between mb-8">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <IconButton onClick={() => setMobileMenuOpen(false)} className="!bg-gray-50"><FiX /></IconButton>
          </div>

          <div className="mb-8">
            <Search />
          </div>

          <div className="flex-grow overflow-y-auto space-y-2">
            <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.2em] mb-4">Explore Heritage</p>
            <MobileNavItem label="Home" to="/" />
            <MobileNavItem label="Shop by Occasion" to="/shop-by-occasion" />
            <MobileNavItem label="Gift Finder Quiz" to="/gift-finder" />
            <MobileNavItem label="Corporate Gifting" to="/occasion/corporate-gifting" />
            <MobileNavItem label="Shop by State" to="/stop-by-state" />
            <MobileNavItem label="All Products" to="/productlist" />
            <MobileNavItem label="Our Artisans" to="/artician" />
            <MobileNavItem label="Bulk Orders" to="/bulk-quote" />
          </div>

          {/* Mobile Footer (Account) */}
          <div className="mt-auto pt-8 px-2 border-t border-stone-100 bg-[#FDFBF7]/50">
            {userData ? (
              <div className="space-y-4">
                {/* User Profile Summary */}
                <div className="flex items-center gap-4 mb-6 p-3 bg-white rounded-2xl border border-stone-100 shadow-sm">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#1A3A32] text-white flex items-center justify-center font-serif text-lg font-bold ring-2 ring-[#C5A059]/30 ring-offset-2">
                      {userData.name[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex-grow">
                    <p className="text-sm font-serif font-bold text-[#1A3A32] leading-tight">
                      {userData.name}
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-[#C5A059]/10 rounded-md border border-[#C5A059]/20">
                      <span className="w-1 h-1 rounded-full bg-[#C5A059]"></span>
                      <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">
                        Patron Member
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Actions */}
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    fullWidth
                    onClick={() => navigate('/myProfile')}
                    className="!justify-start !text-[#1A3A32] !normal-case !font-bold !py-3 !px-4 !rounded-xl hover:!bg-white !transition-all"
                  >
                    <FiUser className="mr-3 text-[#C5A059]" size={18} />
                    Account Settings
                  </Button>

                  <Button
                    fullWidth
                    onClick={logout}
                    className="!justify-start !text-stone-500 hover:!text-red-600 !normal-case !font-semibold !py-3 !px-4 !rounded-xl hover:!bg-red-50 !transition-all"
                  >
                    <FiLogOut className="mr-3" size={18} />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-2">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/login')}
                  className="!bg-[#1A3A32] !rounded-xl !py-4 !font-bold !tracking-[0.2em] !shadow-lg !shadow-[#1A3A32]/10 hover:!bg-[#C5A059] !transition-all"
                >
                  SIGN IN
                </Button>
                <p className="text-center text-[11px] text-stone-400 mt-4 italic">
                  Join our community of heritage lovers
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const NavIcon = ({ icon, title, to, badgeCount, onClick, mobileOnly, hideMobile }) => (
  <div className={`${mobileOnly ? 'md:hidden' : ''} ${hideMobile ? 'hidden lg:block' : ''}`}>
    <Tooltip title={title}>
      {to ? (
        <Link to={to}>
          <IconButton className="!text-gray-800 hover:!bg-[#F9F7F2] hover:!text-[#C5A059] !p-2 md:!p-3 transition-all duration-300">
            <StyledBadge badgeContent={badgeCount}>{React.cloneElement(icon, { size: 24 })}</StyledBadge>
          </IconButton>
        </Link>
      ) : (
        <IconButton onClick={onClick} className="!text-gray-800 hover:!bg-[#F9F7F2] !p-2 md:!p-3 transition-all duration-300">
          {React.cloneElement(icon, { size: 24 })}
        </IconButton>
      )}
    </Tooltip>
  </div>
);

const DropdownItem = ({ icon, label, to }) => (
  <Link to={to} className="flex items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-[#F9F7F2] hover:text-[#0F3D2E] rounded-2xl transition-all group">
    <div className="flex items-center gap-4">
      <span className="text-xl text-gray-300 group-hover:text-[#C5A059] transition-colors">{icon}</span>
      {label}
    </div>
    <FiChevronRight className="text-gray-300 group-hover:translate-x-1 transition-transform" />
  </Link>
);

const MobileNavItem = ({ label, to }) => (
  <Link to={to} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 hover:bg-[#F9F7F2] hover:text-[#0F3D2E] transition-all">
    {label}
    <FiChevronRight className="text-[#C5A059]" />
  </Link>
);

export default memo(Navigation);