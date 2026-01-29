import React from "react";
import { Link } from "react-router-dom";
import { HiCheckCircle, HiSparkles } from "react-icons/hi";

function OrderSuccess() {
  return (
    <div className="bg-[#F9F6F0] flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-[1rem] shadow-2xl border border-[#EDE3D2] p-12 text-center relative">
        <div className="absolute top-10 left-10 text-[#B58D2F]/20 animate-pulse"><HiSparkles size={40} /></div>
        <div className="flex justify-center mb-8">
            <div className="p-4 bg-[#FDFBF7] rounded-full border-4 border-[#B58D2F] animate-bounce">
                <HiCheckCircle size={60} className="text-[#B58D2F]" />
            </div>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#322619] mb-6">Artisan Piece Reserved!</h1>
        <p className="text-lg text-[#544231]/70 mb-10 font-medium leading-relaxed">
          Your order has been recorded for <span className="text-[#322619] font-bold italic">Hand Delivery</span> (Cash on Delivery).
        </p>
        <Link to="/feedback">
          <button className="bg-[#322619] text-white px-12 py-4 rounded-full font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-[#B58D2F] transition-all text-sm">
            Share Your Experience
          </button>
        </Link>
        <p className="mt-8 text-[10px] text-[#544231]/40 uppercase tracking-[0.3em] font-black">Heritage of North East India</p>
      </div>
    </div>
  );
}

export default OrderSuccess;