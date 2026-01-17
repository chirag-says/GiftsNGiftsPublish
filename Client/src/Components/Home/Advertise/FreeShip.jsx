import React from 'react';
import { TbTruckDelivery } from "react-icons/tb";

function FreeShip() {
  return (
    <div className="my-6 w-[95%] max-w-7xl mx-auto px-2">
      {/* Container with Glassmorphism / Modern Shadow */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-300/50">
        
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-6 px-6 md:px-10 gap-4 md:gap-0">
          
          {/* Left: Branding & Icon */}
          <div className="flex items-center gap-4 group">
            <div className="bg-gray-50 p-3 rounded-full group-hover:bg-black transition-colors duration-300">
              <TbTruckDelivery className="text-2xl md:text-3xl text-black group-hover:text-white transition-colors duration-300" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 leading-tight">
                Free Shipping
              </h2>
            </div>
          </div>

          {/* Center: The Offer Message */}
          <div className="flex-1 md:px-12">
            <div className="h-px w-full bg-gray-100 hidden md:block mb-4"></div>
            <p className="text-sm md:text-base text-gray-600 !text-center md:text-center leading-relaxed">
              Unlock <span className="text-black font-bold italic">Free Delivery</span> on your first order 
              or any purchase exceeding <span className="font-black text-black">₹200</span>.
            </p>
          </div>

          {/* Right: The CTA / Highlight */}
          <div className="bg-black text-white px-6  rounded-xl transform hover:scale-105 transition-transform cursor-default">
            <p className="font-black text-xs pt-2 md:text-sm  tracking-tighter">
              Starting At <span className="text-md md:text-xl text-white ml-1 ">₹200*</span>
            </p>
          </div>

        </div>

        {/* Mobile-only Progress Bar Feel */}
        <div className="h-1.5 w-full bg-gray-50 md:hidden">
          <div className="h-full w-1/3 bg-black"></div>
        </div>
      </div>
    </div>
  );
}

export default FreeShip;