import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import { LuUsers, LuUserCheck } from "react-icons/lu"; // Added distinct icon for sellers
import { RiProductHuntLine } from "react-icons/ri";
import { SiHackthebox } from "react-icons/si";
import { TbCategoryPlus, TbSubtask } from "react-icons/tb"; // Added distinct icon for subcat
import { CiLogout } from "react-icons/ci";
import { MyContext } from "../../App.jsx";

function SideBar() {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // To detect active page

  const handleLogout = () => {
    localStorage.removeItem("stoken");
    navigate("/login");
    setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Configuration for Menu Items with Specific Colors
  const navLinks = [
    {
      title: "Dashboard",
      path: "/",
      icon: <RxDashboard />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-500",
    },
    {
      title: "Seller List",
      path: "/sellers",
      icon: <LuUserCheck />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-500",
    },
    {
      title: "Users",
      path: "/users",
      icon: <LuUsers />,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      border: "border-cyan-500",
    },
    {
      title: "Products",
      path: "/products",
      icon: <RiProductHuntLine />,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-500",
    },
    {
      title: "Category",
      path: "/categorylist",
      icon: <TbCategoryPlus />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-500",
    },
    {
      title: "SubCategory",
      path: "/subcategorylist",
      icon: <TbSubtask />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-500",
    },
    {
      title: "Orders List",
      path: "/orders",
      icon: <SiHackthebox />,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-500",
    },
  ];

  return (
    <>
      {/* --- Toggle Button (Floating) --- */}
      <button
        onClick={toggleSidebar}
        className="fixed z-[1050] top-5 left-5 w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 hover:scale-105 transition-all"
        aria-label="Open menu"
      >
        <FaBars size={20} />
      </button>

      {/* --- Overlay Backdrop --- */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1040] transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeSidebar}
      ></div>

      {/* --- Modern Sidebar --- */}
      <div
        className={`
          fixed top-0 left-0 w-[80vw] sm:w-[280px] h-full bg-white z-[1051]
          shadow-2xl shadow-gray-400/50 transform transition-transform duration-300 ease-out
          flex flex-col justify-between
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header Area */}
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-400">Management Dashboard</p>
          </div>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Menu Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={index}
                onClick={closeSidebar}
                className={`
                  relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive ? `${item.bg} ${item.color}` : "text-gray-600 hover:bg-gray-50"}
                `}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md ${item.color.replace('text', 'bg')}`}></div>
                )}

                {/* Icon Container */}
                <span className={`text-xl ${isActive ? item.color : "text-gray-400 group-hover:text-gray-600"}`}>
                  {item.icon}
                </span>

                {/* Text */}
                <span className={`text-[15px] font-semibold tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Footer / Logout Area */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-600 font-semibold hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all duration-200 group"
          >
            <CiLogout className="text-xl group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default SideBar;