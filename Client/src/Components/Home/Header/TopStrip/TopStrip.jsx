// Get up to 50% off now season styles, limited time only ...
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { MdOutlineMenu, MdClose } from "react-icons/md";

function TopStrip() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="relative bg-gray-100 text-[#7d0492] shadow-lg z-50">
      <div className="container mx-auto px-4  flex justify-between items-center">
        {/* Left - Animated Announcement */}
        <div className="flex items-center gap-2 overflow-hidden">
          <p className='pt-2'>
            ✨ Get up to 50% off now season styles, limited time only ...
          </p>
        </div>

        {/* Right - Desktop Links */}
        <div className="hidden sm:flex items-center gap-6">
          {["Help Center", "Order Tracking", "Contact Us"].map((item) => (
            <Link 
              key={item}
              to={`/${item.toLowerCase().replace(" ", "-")}`} 
              className="text-xs font-medium opacity-90 hover:opacity-100 transition-opacity relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="sm:hidden p-1" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? <MdClose size={24} /> : <MdOutlineMenu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`absolute w-full bg-[#6a037d] transition-all duration-300 ease-in-out overflow-hidden ${showMenu ? 'max-h-48 border-b border-purple-400' : 'max-h-0'}`}>
        <ul className="flex flex-col p-4 gap-3 text-sm font-medium">
          <li><Link to="/help-center" onClick={() => setShowMenu(false)}>Help Center</Link></li>
          <li><Link to="/order-tracking" onClick={() => setShowMenu(false)}>Order Tracking</Link></li>
          <li><Link to="/contact-us" onClick={() => setShowMenu(false)}>Contact Us</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default TopStrip;