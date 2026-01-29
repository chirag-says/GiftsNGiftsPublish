import React from 'react';

function Badges({ status }) {
  // Heritage-inspired status palette
  const statusStyles = {
    // Pending: Using the Gold accent from the 'Shop Now' button
    Pending: "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/30",
    
    // Confirm/Processing: Using a light tint of the Forest Green
    Confirm: "bg-[#1a3a32]/5 text-[#1a3a32] border-[#1a3a32]/20",
    
    // Shipped: A soft blue-grey reminiscent of the mountain mist in the homepage photos
    Shipped: "bg-slate-100 text-slate-700 border-slate-200",
    
    // Delivered: The signature Forest Green - signifies success and completion
    Delivered: "bg-[#1a3a32] text-white border-transparent shadow-sm",
    
    // Cancelled: A muted terracotta red (organic earth tone)
    Cancelled: "bg-red-50 text-red-800 border-red-100",
    
    Default: "bg-stone-100 text-stone-600 border-stone-200"
  };

  const currentStyle = statusStyles[status] || statusStyles.Default;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${currentStyle} transition-all duration-300`}>
      {/* The pulse dot is now more subtle and matches the text color */}
      <span className={`w-1.5 h-1.5 rounded-full bg-current mr-2 ${status !== 'Delivered' ? 'animate-pulse' : ''}`}></span>
      {status}
    </span>
  );
}

export default Badges;