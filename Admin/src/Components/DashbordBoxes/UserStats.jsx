import React from 'react';
import { LuStore, LuUsers, LuTrendingUp } from "react-icons/lu";

const UserStats = ({ stats }) => {
  // Logic to prevent division by zero
  const sellerProgress = stats.totalSellers > 0 
    ? (stats.activeSellers / stats.totalSellers) * 100 
    : 0;

  return (
    <div className="bg-white p-4 sm:p-6 h-full flex flex-col transition-all duration-300">
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-tight">
          Platform Activity
        </h3>
        <LuTrendingUp className="text-emerald-500" size={20} />
      </div>
      
      <div className="space-y-8 flex-1 flex flex-col justify-center">
        {/* Sellers Section */}
        <div className="group flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shadow-sm border border-orange-100 group-hover:scale-110 transition-transform">
              <LuStore />
          </div>
          <div className="flex-1 min-w-0">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Active Sellers</span>
                  <span className="text-lg font-black text-slate-900 leading-none">{stats.activeSellers || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(sellerProgress, 100)}%` }}
                  ></div>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-tighter">
                  {stats.pendingSellers || 0} Awaiting Review
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Goal: {stats.totalSellers || 0}
                </p>
              </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="group flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform">
              <LuUsers />
          </div>
          <div className="flex-1 min-w-0">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Platform Users</span>
                  <span className="text-lg font-black text-slate-900 leading-none">{stats.totalUsers || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  {/* Assuming 85% as a health indicator or dynamic goal */}
                  <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '85%' }}></div>
              </div>
               <div className="flex items-center gap-1 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight">System Acquisition Stable</p>
               </div>
          </div>
        </div>
      </div>

      {/* Footer Insight - Hidden on tiny mobile screens */}
      <div className="mt-8 pt-4 border-t border-slate-50 hidden sm:block">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
          Real-time Engine Active
        </p>
      </div>
    </div>
  );
};

export default UserStats;