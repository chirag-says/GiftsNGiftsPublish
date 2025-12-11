import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { GoGift } from "react-icons/go";
import { FaArrowTrendUp } from "react-icons/fa6"; 
import { LiaChartPieSolid } from "react-icons/lia";
import { BsBank2 } from "react-icons/bs";
import { TbBrandProducthunt } from "react-icons/tb";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { Navigation, Autoplay } from 'swiper/modules';
import axios from 'axios';

export default function DashBordBox() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalSellers: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`);
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  // configuration for modern colors
  const cards = [
    {
      icon: <GoGift className='text-[28px]' />,
      label: 'New Orders',
      amount: stats.totalOrders,
      // Blue Gradient
      bgGradient: 'from-blue-500 to-cyan-400',
      shadowColor: 'shadow-blue-200',
      textColor: 'text-blue-600'
    },
    {
      icon: <LiaChartPieSolid className='text-[28px]' />,
      label: 'Total Revenue',
      // FIX: parseInt ensures no decimals are shown
      amount: parseInt(stats.totalRevenue || 0), 
      // Green Gradient
      bgGradient: 'from-emerald-500 to-teal-400',
      shadowColor: 'shadow-emerald-200',
      textColor: 'text-emerald-600'
    },
    {
      icon: <TbBrandProducthunt className='text-[28px]' />,
      label: 'Total Products',
      amount: stats.totalProducts,
      // Purple Gradient
      bgGradient: 'from-violet-600 to-purple-500',
      shadowColor: 'shadow-violet-200',
      textColor: 'text-violet-600'
    },
    {
      icon: <BsBank2 className='text-[28px]' />,
      label: 'Active Sellers',
      amount: stats.totalSellers,
      // Orange Gradient
      bgGradient: 'from-orange-500 to-amber-400',
      shadowColor: 'shadow-orange-200',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="relative w-full py-4">
      <Swiper
        navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 }
        }}
        className="dashboardBoxesSlider !pb-4 px-2"
      >
        {cards.map((item, index) => (
          <SwiperSlide key={index}>
            <div className={`
                relative bg-white rounded-2xl p-6 h-full border border-gray-100
                shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out
                transform hover:-translate-y-1 flex items-center justify-between overflow-hidden group
            `}>
              {/* Decorative Circle in background */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${item.bgGradient}`}></div>

              <div className="flex flex-col gap-1 z-10">
                <h3 className="text-gray-500 text-sm font-medium tracking-wide">{item.label}</h3>
                <b className="text-2xl font-bold text-gray-800 mt-1">
                  {/* The amount is now an integer, so toLocaleString() will not add decimals */}
                  {typeof item.amount === 'number' ? item.amount.toLocaleString('en-IN') : item.amount}
                </b>
                <span className={`text-xs font-semibold ${item.textColor} flex items-center gap-1 mt-2`}>
                   +2.5% <span className="text-gray-400 font-normal">than last week</span>
                </span>
              </div>

              {/* Icon Box */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg
                bg-gradient-to-br ${item.bgGradient} ${item.shadowColor}
                group-hover:scale-110 transition-transform duration-300
              `}>
                {item.icon}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Modern Floating Arrows */}
      <div className="custom-prev absolute top-1/2 -left-3 z-20 -translate-y-1/2 
        w-10 h-10 bg-white/80 backdrop-blur-md hover:bg-white text-gray-700 
        shadow-lg rounded-full flex items-center justify-center cursor-pointer 
        transition-all hover:scale-110 border border-gray-100 hidden md:flex">
        <HiChevronLeft size={22} />
      </div>
      <div className="custom-next absolute top-1/2 -right-3 z-20 -translate-y-1/2 
        w-10 h-10 bg-white/80 backdrop-blur-md hover:bg-white text-gray-700 
        shadow-lg rounded-full flex items-center justify-center cursor-pointer 
        transition-all hover:scale-110 border border-gray-100 hidden md:flex">
        <HiChevronRight size={22} />
      </div>
    </div>
  );
}