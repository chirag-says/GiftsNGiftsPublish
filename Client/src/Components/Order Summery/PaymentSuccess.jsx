import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiCheckCircle, HiArrowRight, HiOutlineShoppingBag } from "react-icons/hi";

function PaymentSuccess() {
  // Logic remains the same
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-12 text-center border border-gray-100">
        
        {/* Success Icon Animation Wrapper */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-ping opacity-20"></div>
            <HiCheckCircle className="text-green-500 text-7xl sm:text-8xl relative z-10" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your payment was processed successfully. We've sent a confirmation email with your order details.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/orders">
            <button className="w-full bg-[#7d0492] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-100 hover:bg-[#600372] transition-all flex items-center justify-center gap-2 group">
              <HiOutlineShoppingBag size={20} />
              View My Orders
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <Link to="/feedback">
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all border border-transparent hover:border-gray-100"
            >
              Share your experience
            </button>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-10 pt-8 border-t border-gray-50">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            GiftnGifts • Secure Transaction
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;