import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlusCircle, FiBox, FiUsers } from 'react-icons/fi';
import { MdOutlineCategory, MdPlaylistAddCheck } from 'react-icons/md';
import { HiOutlineClipboardList } from 'react-icons/hi';

const QuickActions = () => {
    const actions = [
        { 
            title: "All Product", 
            path: "/products", 
            icon: <FiPlusCircle />, 
            color: "bg-indigo-50 text-indigo-600" 
        },
        { 
            title: "Manage Orders", 
            path: "/orders", 
            icon: <FiBox />, 
            color: "bg-emerald-50 text-emerald-600" 
        },
        { 
            title: "Review Sellers", 
            path: "/sellers", 
            icon: <FiUsers />, 
            color: "bg-amber-50 text-amber-600" 
        },
        { 
            title: "Categories", 
            path: "/categorylist", 
            icon: <MdOutlineCategory />, 
            color: "bg-pink-50 text-pink-600" 
        },

        // 🔽 New Requests
        { 
            title: "Category Requests", 
            path: "/category-requests", 
            icon: <HiOutlineClipboardList />, 
            color: "bg-blue-50 text-blue-600" 
        },
        { 
            title: "Subcategory Requests", 
            path: "/subcategory-requests", 
            icon: <MdPlaylistAddCheck />, 
            color: "bg-purple-50 text-purple-600" 
        },
        { 
            title: "Vendor Requests", 
            path: "/sellers", 
            icon: <FiUsers />, 
            color: "bg-rose-50 text-rose-600" 
        },
          { 
        title: "All Users", 
        path: "/users", 
        icon: <FiUsers />, 
        color: "bg-cyan-50 text-cyan-600" 
    },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:px-0">
            {actions.map((action, index) => (
                <Link to={action.path} key={index} className="no-underline group">
                    <div className="bg-white hover:bg-slate-50 p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-3 sm:gap-4 cursor-pointer active:scale-95">
                        
                        <div className={`p-2.5 sm:p-3 rounded-xl text-lg sm:text-xl transition-transform group-hover:scale-110 duration-300 ${action.color}`}>
                            {action.icon}
                        </div>
                        
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-800 text-sm sm:text-base truncate group-hover:text-indigo-600 transition-colors">
                                {action.title}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider hidden sm:block">
                                Quick Access
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default QuickActions;
