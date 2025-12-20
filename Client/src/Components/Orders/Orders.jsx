import React, { useState, useEffect } from "react";
import { FaAngleDown, FaAngleUp, FaBoxOpen, FaCalendarAlt, FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";
import Badges from "./Badges";
import SideMenu from "../My Profile/SideMenu.jsx";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [openOrderIndex, setOpenOrderIndex] = useState(null);
  const [detailedOrder, setDetailedOrder] = useState(null);

  const toggleOrder = async (index) => {
    if (openOrderIndex === index) {
      setOpenOrderIndex(null);
      setDetailedOrder(null);
    } else {
      const orderId = orders[index]._id;
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client/order/${orderId}`);
        if (res.data.success) {
          setDetailedOrder(res.data.order);
          setOpenOrderIndex(index);
        }
      } catch (error) {
        console.error("Error fetching details", error);
      }
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/client/get-orders`);
        if (res.data.success) setOrders(res.data.orders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <section className="py-6 md:py-12 bg-[#f9fafb] min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Occupies full width on mobile, 1/4 on large screens */}
          <div className="lg:w-1/4 w-full">
            <SideMenu />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 w-full">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              
              {/* Header Section */}
              <div className="p-6 md:p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Order History</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage and track your <span className="text-purple-600 font-semibold">{orders.length} orders</span>
                  </p>
                </div>
                <div className="hidden sm:flex p-4 bg-purple-50 rounded-2xl">
                  <FaBoxOpen className="text-purple-600 text-2xl" />
                </div>
              </div>

              {/* Responsive Container */}
              <div className="p-0 md:p-4">
                
                {/* Desktop View (Visible on MD and up) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Amount</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order, idx) => (
                        <OrderRow 
                            key={order._id} 
                            order={order} 
                            idx={idx} 
                            isOpen={openOrderIndex === idx} 
                            onToggle={() => toggleOrder(idx)}
                            detailedOrder={detailedOrder}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (Visible on smaller than MD) */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {orders.map((order, idx) => (
                    <MobileOrderCard 
                        key={order._id} 
                        order={order} 
                        idx={idx} 
                        isOpen={openOrderIndex === idx} 
                        onToggle={() => toggleOrder(idx)}
                        detailedOrder={detailedOrder}
                    />
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** * DESKTOP ROW COMPONENT
 */
const OrderRow = ({ order, idx, isOpen, onToggle, detailedOrder }) => (
    <React.Fragment>
      <tr className={`group transition-all duration-300 ${isOpen ? 'bg-purple-50/40' : 'hover:bg-gray-50'}`}>
        <td className="px-6 py-5">
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-sm">#{order._id.slice(-8).toUpperCase()}</span>
            <div className="flex items-center gap-2 text-gray-400 text-[12px] mt-1">
              <FaCalendarAlt size={10} />
              {new Date(order.placedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </td>
        <td className="px-6 py-5 text-center">
          <Badges status={order.status} />
        </td>
        <td className="px-6 py-5 text-center">
          <span className="font-extrabold text-gray-900 text-base">₹{order.totalAmount.toLocaleString()}</span>
        </td>
        <td className="px-6 py-5 text-right">
          <button
            onClick={onToggle}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all transform active:scale-95 ${
              isOpen ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isOpen ? 'Hide Details' : 'Details'}
            {isOpen ? <FaAngleUp /> : <FaAngleDown />}
          </button>
        </td>
      </tr>
      {isOpen && detailedOrder && <ExpandedContent order={order} detailedOrder={detailedOrder} colSpan={4} />}
    </React.Fragment>
);

/**
 * MOBILE CARD COMPONENT
 */
const MobileOrderCard = ({ order, idx, isOpen, onToggle, detailedOrder }) => (
    <div className={`border rounded-2xl transition-all ${isOpen ? 'border-purple-200 bg-purple-50/20' : 'border-gray-100 bg-white'}`}>
        <div className="p-4 flex justify-between items-center" onClick={onToggle}>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Order #{order._id.slice(-8).toUpperCase()}</span>
                <span className="font-bold text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                <span className="text-[11px] text-gray-500">{new Date(order.placedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Badges status={order.status} />
                <div className={`text-purple-600 p-1 rounded-full bg-purple-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <FaAngleDown />
                </div>
            </div>
        </div>
        {isOpen && detailedOrder && (
            <div className="p-4 border-t border-purple-100">
                <ExpandedContent order={order} detailedOrder={detailedOrder} isMobile />
            </div>
        )}
    </div>
);

/**
 * SHARED EXPANDED CONTENT
 */
const ExpandedContent = ({ order, detailedOrder, colSpan, isMobile }) => {
    const Content = (
        <div className="animate-fadeIn py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                {/* Shipping info card */}
                <div className="bg-white/50 border border-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-purple-600 mb-3">
                        <FaMapMarkerAlt size={14} />
                        <h4 className="text-xs font-bold uppercase tracking-widest">Delivery Details</h4>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{order.shippingAddress?.name}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}, <br/>
                        {order.shippingAddress?.state} - {order.shippingAddress?.pin}
                    </p>
                    <p className="text-xs text-purple-600 mt-2 font-semibold">Contact: {order.shippingAddress?.phone}</p>
                </div>

                {/* Payment info card */}
                <div className="bg-white/50 border border-white p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                        <FaCreditCard size={14} />
                        <h4 className="text-xs font-bold uppercase tracking-widest">Payment Info</h4>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1 border-b border-gray-100/50">
                        <span className="text-gray-500 text-xs">Method</span>
                        <span className="font-bold text-gray-800">{order.paymentId ? "Prepaid" : "COD"}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2">
                        <span className="text-gray-500 text-xs">Transaction ID</span>
                        <span className="font-mono text-[10px] text-gray-400">{order.paymentId || "N/A"}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100">
                    <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Order Summary</h5>
                </div>
                <div className="divide-y divide-gray-50">
                    {detailedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                {item.productId?.images?.[0]?.url ? (
                                    <img src={item.productId.images[0].url} className="w-full h-full object-cover" alt="product" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <h6 className="font-bold text-gray-800 text-sm truncate">{item.productId?.title || item.name}</h6>
                                <p className="text-xs text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-gray-900 text-sm">₹{item.price.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (isMobile) return Content;
    return (
        <tr>
            <td colSpan={colSpan} className="px-6 bg-gray-50/30">
                {Content}
            </td>
        </tr>
    );
};

export default Orders;