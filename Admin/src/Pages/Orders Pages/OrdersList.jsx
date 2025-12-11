import React, { useEffect, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { HiOutlineCube, HiOutlineClipboardList } from "react-icons/hi";
import { MdOutlinePayments } from "react-icons/md";
import Badges from "../../Components/DashbordBoxes/Badges.jsx";
import axios from "axios";

// Helper to assign consistent colors to names
const getAvatarColor = (name) => {
  const colors = [
    "bg-red-100 text-red-600",
    "bg-emerald-100 text-emerald-600",
    "bg-blue-100 text-blue-600",
    "bg-amber-100 text-amber-600",
    "bg-violet-100 text-violet-600",
    "bg-pink-100 text-pink-600",
    "bg-cyan-100 text-cyan-600",
  ];
  const index = name ? name.length % colors.length : 0;
  return colors[index];
};

function OrdersList() {
  const [isOpenOrderdProduct, setOpenOrderdProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  const toggleOrderDetails = (index) => {
    setOpenOrderdProduct(isOpenOrderdProduct === index ? null : index);
  };

  const getOrders = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`
      );
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden my-8">
      
      {/* --- Multi-Color Header Section --- */}
      <div className="px-8 py-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-between text-white shadow-lg relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-3 z-10">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <HiOutlineClipboardList className="text-2xl" />
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-wide">Recent Orders</h2>
                <p className="text-xs text-purple-100 opacity-90">Manage and track your latest sales</p>
            </div>
        </div>
        <span className="text-xs font-bold px-4 py-1.5 bg-white text-purple-600 rounded-full shadow-sm z-10">
            {orders.length} Active Orders
        </span>
      </div>

      {/* --- Table Section --- */}
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-5 w-[50px]">View</th> 
              <th className="px-6 py-5">Order Info</th>
              <th className="px-6 py-5">Customer Profile</th>
              <th className="px-6 py-5">Amount</th>
              <th className="px-6 py-5">Payment</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Placed On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length > 0 ? (
              orders.map((order, index) => {
                const isExpanded = isOpenOrderdProduct === index;
                const avatarClass = getAvatarColor(order.shippingAddress?.name);

                return (
                  <React.Fragment key={order._id}>
                    {/* --- Main Order Row --- */}
                    <tr 
                      className={`
                        transition-all duration-200 group
                        ${isExpanded ? 'bg-indigo-50/40 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}
                      `}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleOrderDetails(index)}
                          className={`
                              w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 shadow-sm
                              ${isExpanded ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'}
                          `}
                        >
                          {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
                        </button>
                      </td>
                      
                      {/* Order ID */}
                      <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-md">
                              #{order._id.slice(-6).toUpperCase()}
                          </span>
                      </td>
                      
                      {/* Customer with Colored Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarClass}`}>
                                {order.shippingAddress?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-700">{order.shippingAddress?.name}</span>
                                <span className="text-xs text-slate-400 font-medium">{order.shippingAddress?.phone}</span>
                            </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                           ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                           <div className={`p-1.5 rounded-full ${order.paymentId ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                <MdOutlinePayments size={14} />
                           </div>
                           <span className={`text-xs font-semibold ${order.paymentId ? 'text-purple-700' : 'text-orange-700'}`}>
                              {order.paymentId ? "Online" : "COD"}
                           </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badges status={order.status} />
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {new Date(order.placedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                        <span className="text-xs text-slate-400 ml-1">
                            '{new Date(order.placedAt).toLocaleDateString("en-IN", { year: "2-digit" })}
                        </span>
                      </td>
                    </tr>

                    {/* --- Expanded Details Row (Warm Theme) --- */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="p-0">
                          <div className="bg-gradient-to-b from-indigo-50/40 to-white p-6 shadow-inner">
                            
                            <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm max-w-5xl mx-auto">
                                {/* Inner Header - Warm/Orange Tone for distinction */}
                                <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineCube className="text-amber-500"/>
                                        <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide">Product Details</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                                        {order.items?.length || 0} ITEMS
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 bg-white border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Item Name</th>
                                                <th className="px-6 py-3 font-medium">Unit Price</th>
                                                <th className="px-6 py-3 font-medium text-center">Qty</th>
                                                <th className="px-6 py-3 font-medium">Subtotal</th>
                                                <th className="px-6 py-3 font-medium">Vendor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {order.items?.map((item) => (
                                                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                                    {/* Product Info */}
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden relative group/img">
                                                                {order.image ? (
                                                                    <img src={order.image} alt="product" className="w-full h-full object-cover"/>
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">IMG</div>
                                                                )}
                                                            </div>
                                                            <div className="max-w-[220px]">
                                                                <p className="text-sm font-semibold text-slate-800 truncate" title={item.productId?.title}>
                                                                    {item.productId?.title || "Unknown Product"}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                    ID: <span className="text-slate-500">{item.productId?._id?.slice(-4)}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-3 text-slate-600">₹{item.price}</td>
                                                    <td className="px-6 py-3 text-center">
                                                        <span className="inline-block w-8 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                                                            {item.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 font-bold text-slate-800">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </td>
                                                    
                                                    {/* Seller Info */}
                                                    <td className="px-6 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-blue-600">
                                                                {item.sellerId?.name || "Admin"}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">{item.sellerId?.email || "-"}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-slate-400 bg-slate-50/30">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                         <HiOutlineCube className="text-4xl text-slate-300" />
                    </div>
                    <p className="font-medium text-slate-500">No orders found</p>
                    <p className="text-xs">New orders will appear here automatically.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersList;