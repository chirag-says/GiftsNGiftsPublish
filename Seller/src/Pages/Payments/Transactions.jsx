import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatINR } from "../../utils/orderMetrics";
import { MdHistory, MdFilterList, MdSearch, MdDownload, MdReceipt, MdOutlineArrowUpward, MdOutlineArrowDownward } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiDownload, FiExternalLink, FiPrinter } from "react-icons/fi";
import { exportToExcel, TRANSACTION_EXPORT_COLUMNS } from "../../utils/exportUtils";

function Transactions() {
  const [data, setData] = useState({ transactions: [], totalAmount: 0, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/seller-panel/finance/transactions?page=${page}&type=${typeFilter}`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, typeFilter]);

  const filteredTransactions = data.transactions.filter(txn =>
    txn.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeStyle = (type) => {
    const map = {
      order: "bg-emerald-50 text-emerald-600 border-emerald-100",
      credit: "bg-emerald-50 text-emerald-600 border-emerald-100",
      refund: "bg-rose-50 text-rose-600 border-rose-100",
      debit: "bg-rose-50 text-rose-600 border-rose-100",
      commission: "bg-amber-50 text-amber-600 border-amber-100",
      payout: "bg-blue-50 text-blue-600 border-blue-100",
    };
    return map[type] || "bg-slate-50 text-slate-600 border-slate-100";
  };

  const stats = {
    totalCredit: data.transactions.filter(t => t.type === 'order' || t.type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalDebit: data.transactions.filter(t => t.type === 'refund' || t.type === 'commission' || t.type === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalRefunds: data.transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalCommission: data.transactions.filter(t => t.type === 'commission').reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-10 space-y-8 bg-[#F8FAFC] min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-500 font-medium">Detailed record of your platform earnings and settlements.</p>
        </div>
        
        <button
          onClick={() => exportToExcel(data.transactions, `ledger_${typeFilter}`, TRANSACTION_EXPORT_COLUMNS)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all"
        >
          <FiDownload className="text-lg" />
          <span>Export Records</span>
        </button>
      </div>

      {/* STATS BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Credits" value={formatINR(stats.totalCredit)} icon={<MdOutlineArrowUpward />} theme="emerald" />
        <StatCard label="Total Debits" value={`-${formatINR(stats.totalDebit)}`} icon={<MdOutlineArrowDownward />} theme="rose" />
        <StatCard label="Returns" value={formatINR(stats.totalRefunds)} icon={<MdHistory />} theme="indigo" />
        <StatCard label="Marketplace Fee" value={formatINR(stats.totalCommission)} icon={<MdReceipt />} theme="amber" />
      </div>

      {/* COMMAND BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-9 relative group">
          <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl" />
          <input
            type="text"
            placeholder="Filter by Order ID, Customer, or Keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none"
          />
        </div>
        
        <div className="md:col-span-3 relative">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 appearance-none outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
          >
            <option value="all">All Entries</option>
            <option value="order">Order Sales</option>
            <option value="refund">Refunds</option>
            <option value="commission">Commissions</option>
            <option value="payout">Bank Payouts</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <MdFilterList size={22} />
          </div>
        </div>
      </div>

      {/* LEDGER MODULE */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-32 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Verifying Transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-32 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <MdHistory size={40} />
             </div>
             <h3 className="text-xl font-black text-slate-800">No Entry Found</h3>
             <p className="text-slate-500 font-medium max-w-xs mx-auto">We couldn't find any transactions matching your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Details</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref. Code</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Cash Flow</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTransactions.map((txn, i) => {
                  const isCredit = txn.type === 'order' || txn.type === 'credit';
                  return (
                    <tr key={i}>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{new Date(txn.date).getFullYear()}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className={`shrink-0 px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-[0.15em] ${getTypeStyle(txn.type)}`}>
                            {txn.type}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{txn.description || txn.customer}</p>
                            {txn.email && <p className="text-[10px] text-slate-400 truncate">{txn.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="font-mono text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 font-bold tracking-tight">
                          {txn.orderId ? `#${txn.orderId.slice(-8).toUpperCase()}` : 'INTERNAL'}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-lg">
                        <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                          {isCredit ? '+' : '−'}{formatINR(txn.amount)}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex justify-center">
                          {txn.orderId ? (
                            <button
                              onClick={() => handleDownloadInvoice(txn)}
                              className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 text-slate-500 rounded-xl hover:border-slate-900 hover:text-slate-900 transition-colors"
                            >
                              <FiPrinter size={18} strokeWidth={2.5} />
                            </button>
                          ) : <span className="text-slate-300">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION BAR */}
        <div className="bg-slate-50/50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
           </div>
           <div className="flex items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-all shadow-lg shadow-slate-200"
              >
                Next Page
              </button>
           </div>
        </div>
      </div>

      {/* FOOTER LEGEND */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
           <LegendItem icon={<MdOutlineArrowUpward />} label="Order Sales" desc="Net earnings from product delivery" color="emerald" />
           <LegendItem icon={<MdHistory />} label="Refunds" desc="Reverse credit for customer returns" color="rose" />
           <LegendItem icon={<MdReceipt />} label="Service Fee" desc="Platform usage & transaction costs" color="amber" />
           <LegendItem icon={<MdDownload />} label="Settlements" desc="Successful payouts to your bank account" color="indigo" />
        </div>
      </div>
    </div>
  );
}

// COMPONENTS
const StatCard = ({ label, value, icon, theme }) => {
  const themes = {
    emerald: "bg-emerald-600 shadow-emerald-100 text-emerald-600",
    rose: "bg-rose-600 shadow-rose-100 text-rose-600",
    indigo: "bg-indigo-600 shadow-indigo-100 text-indigo-600",
    amber: "bg-amber-600 shadow-amber-100 text-amber-600"
  };
  return (
    <div className="bg-white p-8 rounded-[2.2rem] border border-slate-200 shadow-sm relative overflow-hidden">
      <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-6 text-white shadow-lg ${themes[theme].split(' ')[0]}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  );
};

const LegendItem = ({ icon, label, desc, color }) => {
  const colors = { emerald: 'text-emerald-500', rose: 'text-rose-500', amber: 'text-amber-500', indigo: 'text-indigo-500' };
  return (
    <div className="flex flex-col gap-3">
      <div className={`w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center ${colors[color]} border border-slate-100`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <h5 className="font-black text-xs uppercase tracking-widest text-slate-900 leading-none">{label}</h5>
      <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{desc}</p>
    </div>
  );
};

export default Transactions;