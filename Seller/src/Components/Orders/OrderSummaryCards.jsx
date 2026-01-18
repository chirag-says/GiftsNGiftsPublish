import React from "react";
import {
  LuTrendingUp,
  LuCalendar,
  LuClock,
  LuGlobe,
} from "react-icons/lu";

// Configured with gradients similar to your image
const SUMMARY_CONFIG = [
  {
    key: "today",
    title: "Today's Revenue",
    icon: LuClock,
    // Linear gradient from Indigo to Violet
    gradient: "from-indigo-600 to-violet-500",
    shadow: "shadow-indigo-400",
  },
  {
    key: "month",
    title: "This Month",
    icon: LuCalendar,
    // Linear gradient for Emerald/Green
    gradient: "from-emerald-600 to-teal-500",
    shadow: "shadow-emerald-200",
  },
  {
    key: "year",
    title: "This Year",
    icon: LuTrendingUp,
    // Linear gradient for Amber/Orange
    gradient: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-200",
  },
  {
    key: "overall",
    title: "All Time Total",
    icon: LuGlobe,
    // Linear gradient for Purple/Fuchsia
    gradient: "from-purple-600 to-fuchsia-500",
    shadow: "shadow-purple-200",
  },
];

function OrderSummaryCards({ stats, formatAmount, focusedRange, onSelectRange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {SUMMARY_CONFIG.map(({ key, title, icon: Icon, gradient, shadow }) => {
        const data = stats?.[key] || { count: 0, total: 0 };
        const active = focusedRange === key;

        return (
          <button
            key={key}
            onClick={() => onSelectRange(key)}
            className={`relative overflow-hidden p-6 rounded-2xl text-left transition-all duration-300 border-none shadow-lg
              bg-gradient-to-br ${gradient} ${shadow}
              ${active ? "ring-4 ring-white/30 scale-[1.02]" : "hover:scale-[1.01] hover:shadow-xl"}
            `}
          >
            {/* Background Decorative Circle (Glassmorphism effect from image) */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-2 right-2 w-12 h-12 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-bold text-white/90 tracking-wide">
                  {title}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {formatAmount(data.total)}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-white">
                    {data.count}
                  </span>
                  <span className="text-xs text-white/70 uppercase font-medium tracking-tighter">
                    Orders
                  </span>
                </div>
              </div>

              {/* Decorative Progress bar feel at bottom */}
              <div className="mt-4 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 w-2/3" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default OrderSummaryCards;