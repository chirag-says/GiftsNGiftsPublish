import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { FiTrendingUp, FiCalendar } from "react-icons/fi";

// 🔹 Enhanced Tooltip Design
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 shadow-2xl border border-gray-100 rounded-xl">
        <p className="font-bold text-gray-800 border-b border-gray-50 pb-2 mb-2">{label}</p>
        <div className="space-y-1.5">
          <div className="flex justify-between gap-8 items-center">
            <span className="text-gray-500 text-xs">Revenue</span>
            <span className="text-indigo-600 font-bold text-sm">₹{data.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-8 items-center">
            <span className="text-gray-500 text-xs">Orders</span>
            <span className="text-gray-800 font-semibold text-xs">{data.totalOrders}</span>
          </div>
          <div className="flex justify-between gap-8 items-center">
            <span className="text-gray-500 text-xs">Avg. Value</span>
            <span className="text-gray-800 font-semibold text-xs">₹{Math.round(data.averageOrderValue)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart = () => {
  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeFilter, setActiveFilter] = useState(30);

  useEffect(() => {
    fetchRevenue();
  }, [startDate, endDate]);

  const fetchRevenue = async () => {
    try {
      const { data } = await api.get("/api/admin/reports/revenue", {
        params: { startDate, endDate }
      });
      if (data.success) {
        const formatted = data.data.map(item => ({
          date: item._id,
          totalRevenue: item.totalRevenue,
          totalOrders: item.totalOrders,
          averageOrderValue: item.averageOrderValue
        })).reverse();
        setChartData(formatted);
      }
    } catch (error) {
      console.error("Revenue Analytics Error", error);
    }
  };

  const applyQuickFilter = (days) => {
    setActiveFilter(days);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FiTrendingUp className="text-indigo-600" />
            </div>
            Revenue Growth
          </h3>
          <p className="text-xs text-gray-400 ml-10">Real-time sales performance</p>
        </div>

        {/* Improved Filter UI */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            {[
              { label: '7D', val: 7 },
              { label: '30D', val: 30 }
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => applyQuickFilter(f.val)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeFilter === f.val 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            <FiCalendar className="text-gray-400 text-xs" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setActiveFilter(null); }}
              className="bg-transparent text-xs font-medium outline-none text-gray-600 cursor-pointer"
            />
            <span className="text-gray-300">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setActiveFilter(null); }}
              className="bg-transparent text-xs font-medium outline-none text-gray-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
              dy={15}
              tickFormatter={(str) => {
                // Short date format (e.g., Jan 12)
                const date = new Date(str);
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`}
              tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
            />
            <CartesianGrid vertical={false} stroke="#f8fafc" strokeDasharray="0" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />

            <Area
              type="monotone"
              dataKey="totalRevenue"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#dashboardRevenue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;