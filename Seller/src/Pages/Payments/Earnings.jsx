import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { MdAccountBalanceWallet, MdTrendingUp, MdDownload } from "react-icons/md";
import { FiDollarSign, FiClock, FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { exportToExcel, EARNINGS_EXPORT_COLUMNS } from "../../utils/exportUtils";

function Earnings() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    withdrawableBalance: 0,
    monthlyEarnings: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/seller-panel/finance/earnings?period=${period}`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const maxEarning = Math.max(...(data.monthlyEarnings?.map(d => d.amount) || [1]));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Earnings Hub</h1>
          <p className="text-gray-500 font-medium">Overview of your payouts and financial health</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="6months">Last 6 Months</option>
            <option value="month">This Month</option>
          </select>
          
          <button
            onClick={() => {
              const exportData = [
                { type: 'summary', description: 'Total Earnings', amount: data.totalEarnings },
                { type: 'summary', description: 'Withdrawable Balance', amount: data.withdrawableBalance },
                { type: 'summary', description: 'Pending Earnings', amount: data.pendingEarnings },
                ...data.recentTransactions
              ];
              exportToExcel(exportData, `earnings_${period}`, EARNINGS_EXPORT_COLUMNS);
            }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            <MdDownload className="text-lg" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <div className="animate-spin w-12 h-12 border-[5px] border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Ledger</p>
        </div>
      ) : (
        <>
          {/* Dashboard Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <MdAccountBalanceWallet size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <p className="text-indigo-100 font-black uppercase tracking-widest text-xs">Lifetime Sales</p>
                <h3 className="text-4xl font-black">{formatINR(data.totalEarnings)}</h3>
                <div className="flex items-center gap-2 text-indigo-100/80 text-sm font-semibold">
                  <MdTrendingUp />
                  <span>Growth is consistent</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-emerald-500/20 rounded-3xl p-8 shadow-sm relative group">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Available Payout</p>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><FiCheckCircle size={20} /></div>
                </div>
                <h3 className="text-4xl font-black text-gray-900">{formatINR(data.withdrawableBalance)}</h3>
                <button 
                  onClick={() => navigate('/payments/payouts')} 
                  className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all text-sm"
                >
                  Withdraw Now <FiChevronRight />
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm md:col-span-2 lg:col-span-1">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">In Escrow</p>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FiClock size={20} /></div>
                </div>
                <h3 className="text-4xl font-black text-gray-900">{formatINR(data.pendingEarnings)}</h3>
                <p className="text-gray-400 text-xs font-semibold">Settlement in progress for latest orders</p>
              </div>
            </div>
          </div>

          {/* Monthly Trend Visualizer */}
          <div className="bg-white border border-gray-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-2">
              <FiActivity className="text-indigo-600" /> Revenue Flow
            </h3>

            {data.monthlyEarnings?.length === 0 ? (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 font-medium italic">
                No activity recorded for this period
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar pt-10">
                <div className="h-64 flex items-end gap-3 md:gap-6 min-w-full lg:min-w-0">
                  {data.monthlyEarnings?.map((month, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative min-w-[60px]">
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
                          {formatINR(month.amount)}
                        </div>
                      </div>
                      <div
                        className="w-full max-w-[40px] bg-indigo-50 group-hover:bg-indigo-600 rounded-t-xl transition-all duration-500 ease-out relative shadow-sm"
                        style={{ height: `${(month.amount / maxEarning) * 100}%`, minHeight: '10px' }}
                      >
                         <div className="absolute top-0 left-0 w-full h-1 bg-white/20 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="mt-4 text-xs font-bold text-gray-400 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-slate-50/30">
              <h3 className="font-black text-gray-800 tracking-tight">Recent Activity</h3>
            </div>

            {data.recentTransactions?.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium">No ledger entries found.</div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-x-auto">
                {data.recentTransactions?.map((tx, i) => (
                  <div key={i} className="px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-all">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 ${
                        tx.type === 'order' ? 'bg-emerald-50 text-emerald-600' :
                        tx.type === 'refund' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <FiDollarSign className="text-xl" strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{tx.description}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">#{tx.orderId || 'TXN-GENERAL'}</p>
                    </div>

                    <div className="flex sm:flex-col justify-between items-center sm:items-end gap-2">
                      <p className={`font-black text-lg ${tx.type === 'refund' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {tx.type === 'refund' ? '-' : '+'}{formatINR(tx.amount)}
                      </p>
                      <p className="!text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout Help Info */}
          <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
              <FiDollarSign size={24} />
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs">Settlement Guidelines</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                {[
                  "Earnings credit after delivery confirmation",
                  "Standard 7-day settlement cycle",
                  "Commissions deducted at source",
                  "Minimum payout threshold: ₹500"
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-indigo-700 font-semibold">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Sub-icons used for the Activity section
const FiActivity = ({ className }) => (
  <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default Earnings;