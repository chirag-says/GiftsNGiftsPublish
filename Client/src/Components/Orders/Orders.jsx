import React, { useState, useEffect } from "react";
import { FaAngleDown, FaAngleUp, FaBoxOpen, FaCalendarAlt, FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";
import Badges from "./Badges"; // Assuming Badges handles its own internal status colors
import SideMenu from "../My Profile/SideMenu.jsx";
import api from "../../utils/api";

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
        const res = await api.get(`/api/client/order/${orderId}`);
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
        const res = await api.get('/api/client/get-orders');
        if (res.data.success) setOrders(res.data.orders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  return (
    // Updated Background to warm heritage cream
    <section className="py-6 md:py-12 bg-[#fcfcf9]  min-h-screen font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <div className="lg:w-1/4 w-full">
            <SideMenu />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">

              {/* Header Section - Heritage Style */}
              <div className="p-6 md:p-10 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#1a3a32] tracking-tight">Order History</h1>
                  <p className="text-stone-500 text-sm mt-1">
                    Past treasures and active shipments — <span className="text-[#c5a059] font-bold">{orders.length} orders</span>
                  </p>
                </div>
                <div className="hidden sm:flex p-4 bg-[#fdfbf7] border border-[#c5a059]/20 rounded-2xl">
                  <FaBoxOpen className="text-[#c5a059] text-2xl" />
                </div>
              </div>

              <div className="p-0 md:p-4">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        <th className="px-6 py-4">Ref Number</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Total</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
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

                {/* Mobile View */}
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

const OrderRow = ({ order, idx, isOpen, onToggle, detailedOrder }) => (
  <React.Fragment>
    <tr className={`group transition-all duration-300 ${isOpen ? 'bg-[#fdfbf7]' : 'hover:bg-stone-50/50'}`}>
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="font-bold text-[#1a3a32] text-sm">#{order._id.slice(-8).toUpperCase()}</span>
          <div className="flex items-center gap-2 text-stone-400 text-[11px] mt-1 italic">
            <FaCalendarAlt size={10} className="text-[#c5a059]" />
            {new Date(order.placedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-center">
        <Badges status={order.status} />
      </td>
      <td className="px-6 py-5 text-center">
        <span className="font-bold text-[#1a3a32] text-base">₹{order.totalAmount.toLocaleString()}</span>
      </td>
      <td className="px-6 py-5 text-right">
        <button
          onClick={onToggle}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            isOpen 
            ? 'bg-[#1a3a32] text-white shadow-md' 
            : 'bg-[#fdfbf7] text-[#1a3a32] border border-stone-200 hover:border-[#c5a059] hover:bg-white'
          }`}
        >
          {isOpen ? 'Close' : 'View Order'}
          {isOpen ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </td>
    </tr>
    {isOpen && detailedOrder && <ExpandedContent order={order} detailedOrder={detailedOrder} colSpan={4} />}
  </React.Fragment>
);

const MobileOrderCard = ({ order, idx, isOpen, onToggle, detailedOrder }) => (
  <div className={`border rounded-xl transition-all ${isOpen ? 'border-[#c5a059]/50 bg-[#fdfbf7]' : 'border-stone-100 bg-white'}`}>
    <div className="p-4 flex justify-between items-center" onClick={onToggle}>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">#{order._id.slice(-8).toUpperCase()}</span>
        <span className="font-bold text-[#1a3a32]">₹{order.totalAmount.toLocaleString()}</span>
        <span className="text-[11px] text-stone-500 italic">{new Date(order.placedAt).toLocaleDateString()}</span>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badges status={order.status} />
        <div className={`text-[#c5a059] p-1 rounded-full bg-white border border-stone-100 transition-transform ${isOpen ? 'rotate-180 shadow-sm' : ''}`}>
          <FaAngleDown />
        </div>
      </div>
    </div>
    {isOpen && detailedOrder && (
      <div className="p-4 border-t border-stone-100">
        <ExpandedContent order={order} detailedOrder={detailedOrder} isMobile />
      </div>
    )}
  </div>
);

const ExpandedContent = ({ order, detailedOrder, colSpan, isMobile }) => {
  const Content = (
    <div className="animate-fadeIn py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Shipping info card */}
        <div className="bg-white border border-stone-100 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-[#c5a059] mb-4">
            <FaMapMarkerAlt size={14} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Shipping Destination</h4>
          </div>
          <p className="text-sm font-bold text-[#1a3a32]">{order.shippingAddress?.name}</p>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {order.shippingAddress?.address}, {order.shippingAddress?.city}, <br />
            {order.shippingAddress?.state} - {order.shippingAddress?.pin}
          </p>
          <div className="mt-4 pt-3 border-t border-stone-50 flex items-center justify-between">
             <span className="text-[10px] text-stone-400 uppercase font-bold">Contact</span>
             <span className="text-xs text-[#1a3a32] font-semibold">{order.shippingAddress?.phone}</span>
          </div>
        </div>

        {/* Payment info card */}
        <div className="bg-white border border-stone-100 p-5 rounded-xl">
          <div className="flex items-center gap-2 text-[#1a3a32] mb-4">
            <FaCreditCard size={14} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Payment Ledger</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400 text-xs">Method</span>
              <span className="font-bold text-[#1a3a32]">{order.paymentId ? "Prepaid / Online" : "Cash on Delivery"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-400 text-xs">Transaction ID</span>
              <span className="font-mono text-[10px] text-stone-400 truncate max-w-[120px]">{order.paymentId || "Pending"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 px-4 py-3 border-b border-stone-100">
          <h5 className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Artisanal Items</h5>
        </div>
        <div className="divide-y divide-stone-50">
          {detailedOrder.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-stone-50/50 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#fdfbf7] border border-stone-100 flex-shrink-0">
                {item.productId?.images?.[0]?.url ? (
                  <img src={item.productId.images[0].url} className="w-full h-full object-cover" alt="product" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-300">No Image</div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h6 className="font-serif font-bold text-[#1a3a32] text-sm truncate">{item.productId?.title || item.name}</h6>
                <p className="text-[11px] text-stone-400 mt-1 uppercase tracking-tighter">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#1a3a32] text-sm">₹{item.price.toLocaleString()}</span>
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
      <td colSpan={colSpan} className="px-6 bg-[#fdfbf7]/50 border-stone-100">
        {Content}
      </td>
    </tr>
  );
};

export default Orders;