import React from "react";
import { formatINR } from "../../utils/orderMetrics";
import { Package, IndianRupee, TrendingUp, Tag, AlertCircle } from "lucide-react";

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Math.round(value));

const SUMMARY_BLUEPRINT = [
  { key: "count", label: "Total Listings", icon: Package, color: "blue", formatter: (value) => formatNumber(value || 0) },
  { key: "totalValue", label: "Inventory Value", icon: IndianRupee, color: "emerald", formatter: (value) => formatINR(value || 0) },
  { key: "avgPrice", label: "Avg. Price", icon: TrendingUp, color: "indigo", formatter: (value) => formatINR(value || 0) },
  { key: "avgDiscount", label: "Avg. Discount", icon: Tag, color: "orange", formatter: (value) => `${Math.round(value || 0)}%` },
  { key: "lowStock", label: "Low Stock Items", icon: AlertCircle, color: "rose", formatter: (value) => formatNumber(value || 0) },
];

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/10",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-500/10",
  orange: "bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/10",
  rose: "bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10",
};

function StatusSummaryCards({ summary = {}, statusKey }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {SUMMARY_BLUEPRINT.map((item) => {
        const Icon = item.icon;
        const isLowStockWarning = statusKey === "active" && item.key === "lowStock";

        return (
          <div
            key={item.key}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-6 transition-all duration-300  hover:shadow-2xl hover:shadow-gray-200/50 ${
              isLowStockWarning 
                ? "border-amber-200 bg-amber-50/50 shadow-sm" 
                : "border-gray-100 bg-white"
            }`}
          >
            {/* Glossy Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/40 pointer-events-none" />
            
            <div className="relative flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ring-4 shadow-sm transition-transform duration-500 group-hover:rotate-12 ${colorMap[item.color]}`}>
                <Icon size={24} strokeWidth={2} />
              </div>
              {isLowStockWarning && (
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>

            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">
                {item.label}
              </p>
              <h3 className={`text-2xl font-black tracking-tight mt-1 ${isLowStockWarning ? 'text-amber-700' : 'text-gray-900'}`}>
                {item.formatter(summary[item.key] ?? 0)}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusSummaryCards;