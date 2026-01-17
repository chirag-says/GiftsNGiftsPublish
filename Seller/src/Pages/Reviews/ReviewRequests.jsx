import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { MdStar, MdMail, MdSchedule, MdCheck } from "react-icons/md";
import { FiSend, FiClock, FiPackage, FiRefreshCw } from "react-icons/fi";

function ReviewRequests() {
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    autoRequest: false,
    delayDays: 3,
    reminderEnabled: false,
    reminderDays: 7
  });
  const [stats, setStats] = useState({
    requestsSent: 0,
    reviewsReceived: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/seller-panel/reviews/requests');
      if (res.data.success) {
        setOrders(res.data.data.orders || []);
        setSettings(res.data.data.settings || settings);
        setStats(res.data.data.stats || stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (orderId) => {
    setSending(orderId);
    try {
      await api.post(`/api/seller-panel/reviews/requests/${orderId}/send`, {});
      fetchData();
    } catch (err) {
      alert("Failed to send request");
    } finally {
      setSending(null);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/api/seller-panel/reviews/requests/settings', settings);
      alert("Settings saved!");
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Review Requests</h1>
        <p className="text-sm text-gray-500">Request reviews from customers after delivery</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Stats - Grid adapts from 1 to 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <FiSend className="text-xl" />
                <span className="text-sm">Requests Sent</span>
              </div>
              <h3 className="text-2xl font-bold">{stats.requestsSent}</h3>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <MdStar className="text-xl" />
                <span className="text-sm">Reviews Received</span>
              </div>
              <h3 className="text-2xl font-bold">{stats.reviewsReceived}</h3>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2 text-purple-600">
                <FiRefreshCw className="text-xl" />
                <span className="text-sm">Conversion Rate</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stats.conversionRate}%</h3>
            </div>
          </div>

          {/* Auto-Request Settings */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiSend className="text-blue-500" /> Automation Settings
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl gap-4">
                <div>
                  <span className="font-medium text-gray-800 block">Auto-send Review Requests</span>
                  <p className="text-xs sm:text-sm text-gray-500 font-normal">Automatically request reviews after delivery</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.autoRequest}
                    onChange={(e) => setSettings({ ...settings, autoRequest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.autoRequest && (
                <div className="pl-4 border-l-2 border-blue-200 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                    <span className="text-gray-700">Send request</span>
                    <input
                      type="number"
                      value={settings.delayDays}
                      onChange={(e) => setSettings({ ...settings, delayDays: parseInt(e.target.value) || 0 })}
                      className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none"
                      min="1"
                      max="30"
                    />
                    <span className="text-gray-700">days after delivery</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={settings.reminderEnabled}
                        onChange={(e) => setSettings({ ...settings, reminderEnabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">Send reminder after</span>
                    </label>
                    <input
                      type="number"
                      value={settings.reminderDays}
                      onChange={(e) => setSettings({ ...settings, reminderDays: parseInt(e.target.value) || 0 })}
                      className="w-16 p-2 border border-gray-300 rounded-lg text-center disabled:bg-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                      min="3"
                      max="30"
                      disabled={!settings.reminderEnabled}
                    />
                    <span className="text-gray-700">days if no review</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm active:scale-95"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800">📦 Ready for Review Request</h3>
              <p className="text-xs sm:text-sm text-gray-500">Orders delivered but not yet requested</p>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FiPackage className="text-5xl mx-auto mb-3 text-gray-200" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No orders currently pending review request.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.map((order, i) => (
                  <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                    {/* Image and Info Container */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {order.productImage ? (
                          <img src={order.productImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FiPackage size={20} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate text-sm sm:text-base">{order.productName}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 uppercase tracking-wider font-medium">
                          <span>#{order.orderId}</span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-green-600">
                          <FiClock className="shrink-0" />
                          <span>Delivered {new Date(order.deliveredAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status/Action Button */}
                    <div className="sm:ml-auto shrink-0 mt-2 sm:mt-0">
                      {order.reviewRequested ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                          <MdCheck />
                          <span>Requested</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(order._id)}
                          disabled={sending === order._id}
                          className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100"
                        >
                          {sending === order._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <MdMail className="text-lg" /> Request Review
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 shadow-sm">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                <FiRefreshCw /> Tips for High Conversion
            </h4>
            <ul className="text-sm text-amber-900/80 space-y-2 font-medium">
              <li className="flex gap-2 leading-relaxed">
                <span className="text-amber-500 mt-1">•</span> 
                Request reviews 3-5 days after delivery so the customer has time to use the product.
              </li>
              <li className="flex gap-2 leading-relaxed">
                <span className="text-amber-500 mt-1">•</span> 
                Ensure your automation is enabled to catch every order without manual work.
              </li>
              <li className="flex gap-2 leading-relaxed">
                <span className="text-amber-500 mt-1">•</span> 
                Personalize your service - customers who feel cared for are 3x more likely to review.
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default ReviewRequests;