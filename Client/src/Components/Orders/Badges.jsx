import React from 'react';

function Badges({ status }) {
  // Define status-specific styles
  const statusStyles = {
    Pending: "bg-purple-100 text-purple-700 border-purple-200",
    Confirm: "bg-amber-100 text-amber-700 border-amber-200",
    Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Default: "bg-gray-100 text-gray-700 border-gray-200"
  };

  const currentStyle = statusStyles[status] || statusStyles.Default;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${currentStyle} transition-all duration-300`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
      {status}
    </span>
  );
}

export default Badges;