import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatINR } from "../../utils/orderMetrics";
import { MdAccountBalance, MdAdd, MdCheck, MdClose, MdAccessTime, MdPendingActions, MdDownload } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { exportToExcel, PAYOUT_EXPORT_COLUMNS } from "../../utils/exportUtils";

function Payouts() {
  const [data, setData] = useState({
    payouts: [],
    availableBalance: 0,
    totalWithdrawn: 0,
    pendingAmount: 0,
    pendingOrders: [],
    totalPendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payoutsRes, pendingRes] = await Promise.all([
        api.get("/api/seller-panel/finance/payouts"),
        api.get("/api/seller-panel/finance/pending-payments")
      ]);

      const payoutsData = payoutsRes.data.success ? payoutsRes.data.data : {};
      const pendingData = pendingRes.data.success ? pendingRes.data.data : {};

      setData({
        payouts: payoutsData.payouts || [],
        availableBalance: payoutsData.availableBalance || 0,
        totalWithdrawn: payoutsData.totalWithdrawn || 0,
        pendingAmount: pendingData.pendingAmount || 0,
        pendingOrders: pendingData.pendingOrders || [],
        totalPendingOrders: pendingData.totalPendingOrders || 0
      });
    } catch (err) {
      console.error("Error fetching payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (!requestAmount || parseFloat(requestAmount) <= 0) return;

    setSubmitting(true);
    try {
      const res = await api.post(
        "/api/seller-panel/finance/payouts",
        { amount: parseFloat(requestAmount), paymentMethod }
      );
      if (res.data.success) {
        setShowModal(false);
        setRequestAmount("");
        fetchData();
        alert("Payout request submitted successfully!");
      } else {
        alert(res.data.message || "Failed to submit payout request");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit payout request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <MdCheck className="text-emerald-600" />;
      case "Credited": return <MdAccountBalance className="text-blue-600" />;
      case "Processing": return <FiClock className="text-indigo-600" />;
      case "Pending": return <MdAccessTime className="text-amber-600" />;
      case "Failed": case "Cancelled": return <MdClose className="text-rose-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Credited": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Processing": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Failed": case "Cancelled": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const pendingRequestsCount = data.payouts.filter(p => ["Pending", "Processing"].includes(p.status)).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-md border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-[600] text-slate-900 tracking-tight">Payout Management</h1>
          <p className="text-slate-500 font-medium text-sm">Withdraw your earnings and track settlements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToExcel(data.payouts, 'payouts', PAYOUT_EXPORT_COLUMNS)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
          >
            <MdDownload size={20} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
          >
            <MdAdd size={20} />
            <span>Request Funds</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Balance...</p>
        </div>
      ) : (
        <>
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Available" value={formatINR(data.availableBalance)} icon={<MdAccountBalance />} color="bg-emerald-600" sub="Ready to withdraw" />
            <StatCard label="In Settlement" value={formatINR(data.pendingAmount)} icon={<MdPendingActions />} color="bg-amber-500" sub={`${data.totalPendingOrders} orders pending`} />
            <StatCard label="Life-time" value={formatINR(data.totalWithdrawn)} icon={<MdCheck />} color="bg-slate-800" sub="Total withdrawn" />
            <StatCard label="Active Requests" value={pendingRequestsCount} icon={<FiClock />} color="bg-indigo-600" sub="Awaiting bank processing" />
          </div>

          {/* Pending Settlements Table */}
          {data.pendingOrders.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="px-8 py-6 bg-amber-50/50 border-b border-amber-100">
                <h3 className="font-black text-slate-800 tracking-tight">Pending Settlements</h3>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                      <th className="px-8 py-4 text-center">Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.pendingOrders.slice(0, 5).map((order, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-8 py-4 font-mono text-xs font-bold text-indigo-600 tracking-tighter">#{order.orderId?.slice(-8).toUpperCase()}</td>
                        <td className="px-8 py-4 font-bold text-slate-700 text-sm">{order.customer}</td>
                        <td className="px-8 py-4 text-right font-black text-slate-900">{formatINR(order.amount)}</td>
                        <td className="px-8 py-4 text-center">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* History Table */}
          <section className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="font-black text-slate-800 tracking-tight">Withdrawal History</h3>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Request Date</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                    <th className="px-8 py-4 text-center">Status</th>
                    <th className="px-8 py-4">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.payouts.map((payout, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-8 py-4 font-bold text-slate-900 text-sm">{new Date(payout.requestedAt).toLocaleDateString()}</td>
                      <td className="px-8 py-4 text-right font-black text-slate-900">{formatINR(payout.amount)}</td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(payout.status)}`}>
                          {getStatusIcon(payout.status)} {payout.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-400 text-xs">{payout.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FIX: Withdrawal Policy Section - Removed DIV inside P */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
             <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <MdAccountBalance size={28} />
             </div>
             <div>
                <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-3">Withdrawal Policy</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                   <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700/80">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                      Min threshold: ₹500
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700/80">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                      Settlement: 5-7 days post-delivery
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700/80">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                      Processed within 48-72h
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700/80">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                      Direct Bank Transfer (NEFT/UPI)
                   </div>
                </div>
             </div>
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Request Funds</h3>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <MdClose size={24} />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-6">
              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Available for Transfer</label>
                <div className="text-3xl font-black text-indigo-700">{formatINR(data.availableBalance)}</div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Withdraw Amount</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400 group-focus-within:text-indigo-600 transition-colors">₹</span>
                  <input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    max={data.availableBalance}
                    min={500}
                    placeholder="Min 500"
                    className="w-full pl-10 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                    required
                  />
                </div>
                {requestAmount && parseFloat(requestAmount) < 500 && (
                  <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wide px-2">Minimum withdrawal is ₹500</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Payout Gateway</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !requestAmount || parseFloat(requestAmount) > data.availableBalance || parseFloat(requestAmount) < 500}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:shadow-none"
              >
                {submitting ? "Processing..." : "Confirm Payout"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
    <div className={`p-3 rounded-2xl text-white ${color} w-fit mb-4 transition-transform group-hover:scale-110 shadow-lg`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 truncate tracking-tight">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">{sub}</p>
  </div>
);

export default Payouts;