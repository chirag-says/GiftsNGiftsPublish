import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
// FIXED: Added FiArrowRight to the imports below
import { FiCalendar, FiActivity, FiArrowRight } from "react-icons/fi"; 
import { CircularProgress } from "@mui/material";

// Components
import DashBordBox from "../../Components/DashbordBoxes/DashBordBox.jsx";
import OrdersList from "../Orders Pages/OrdersList.jsx";
import RevenueChart from "../../Components/Charts/RevenueChart.jsx";
import UserStats from "../../Components/DashbordBoxes/UserStats.jsx";
import QuickActions from "../../Components/DashbordBoxes/QuickActions.jsx";

function DashBoard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalSellers: 0,
        totalUsers: 0,
        activeSellers: 0,
        pendingSellers: 0,
        monthlyRevenue: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get("/api/admin/stats");
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center flex-col gap-4">
                <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-indigo-500 font-semibold animate-pulse text-sm">Loading Analytics...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-x-hidden font-sans pb-10">

            {/* --- DESIGN ELEMENT: Colorful Top Background --- */}
            <div className="absolute top-0 left-0 w-full h-[300px] sm:h-[350px] bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 rounded-b-[30px] sm:rounded-b-[40px] -z-10"></div>
            
            {/* decorative blobs */}
            <div className="hidden sm:block absolute top-10 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="hidden sm:block absolute top-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-2 py-6 sm:py-4 space-y-6 sm:space-y-4">

                {/* 1. Colorful Header Section */}
                <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-bold border border-white/30 uppercase tracking-widest">
                                    Admin Console
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Dashboard Overview</h1>
                            <p className="text-blue-100 mt-1 text-xs sm:text-sm font-medium opacity-90">
                                Welcome back! Track your store's colorful progress today.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl w-full sm:w-auto justify-center sm:justify-start">
                            <div className="p-2 bg-white text-indigo-600 rounded-xl shadow-sm flex-shrink-0">
                                <FiCalendar size={20} />
                            </div>
                            <div className="pr-2 min-w-max">
                                <p className="text-[10px] text-blue-100 uppercase font-bold">Today's Date</p>
                                <p className="text-sm font-bold">
                                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Top Stats Cards */}
                <section className="relative z-10">
                    <DashBordBox />
                </section>

                {/* 3. Quick Actions Bar */}
                <section className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                    <div className="min-w-max px-4 py-2">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Access</h3>
                        <QuickActions />
                    </div>
                </section>

                {/* 4. Charts & Activity Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col min-w-0">
                        <div className="relative bg-white rounded-3xl shadow-xl border border-indigo-50 p-1 h-full overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                            <div className="p-2 sm:p-4 h-full">
                                <RevenueChart monthlyData={stats.monthlyRevenue} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex flex-col min-w-0">
                        <div className="relative bg-white rounded-3xl shadow-xl  border border-cyan-50 p-1 h-full overflow-hidden group transition-all duration-300">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                            <div className="p-4 h-full">
                                <UserStats stats={stats} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Recent Orders Section */}
                <section className="pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-2 gap-3">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                            <FiActivity className="text-indigo-600" /> Recent Orders
                        </h2>
                        <button 
                            onClick={() => navigate('/orders')}
                            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 group"
                        >
                            View All Transactions <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/40 border border-orange-50 overflow-hidden relative">
                        <div className="overflow-x-auto no-scrollbar">
                            <div className="min-w-[800px] lg:min-w-full">
                                <OrdersList />
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}

export default DashBoard;