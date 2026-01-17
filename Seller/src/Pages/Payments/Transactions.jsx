import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatINR } from "../../utils/orderMetrics";
import { MdHistory, MdFilterList, MdSearch, MdDownload, MdReceipt, MdOutlineArrowUpward, MdOutlineArrowDownward } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiDownload, FiExternalLink } from "react-icons/fi";
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
        const res = await api.get(
          `/api/seller-panel/finance/transactions?page=${page}&type=${typeFilter}`
        );
        if (res.data.success) {
          setData(res.data.data);
        }
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

  const getTypeBadge = (type) => {
    const styles = {
      order: "bg-emerald-50 text-emerald-700 border-emerald-100",
      credit: "bg-emerald-50 text-emerald-700 border-emerald-100",
      refund: "bg-rose-50 text-rose-700 border-rose-100",
      debit: "bg-rose-50 text-rose-700 border-rose-100",
      commission: "bg-amber-50 text-amber-700 border-amber-100",
      payout: "bg-blue-50 text-blue-700 border-blue-100",
    };
    return styles[type] || "bg-slate-50 text-slate-700 border-slate-100";
  };

  const handleDownloadInvoice = (txn) => {
    const invoiceDate = new Date(txn.date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const invoiceNumber = `INV-${txn.orderId?.slice(-8).toUpperCase() || Date.now()}`;
    const isCredit = txn.type === 'order' || txn.type === 'credit';

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 60px; border: 1px solid #e2e8f0; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo h1 { color: #4f46e5; font-size: 24px; font-weight: 800; }
          .invoice-info { text-align: right; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .party-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .details-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; border-bottom: 2px solid #e2e8f0; }
          .details-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .totals { margin-left: auto; width: 250px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { border-top: 2px solid #e2e8f0; margin-top: 8px; padding-top: 16px; font-weight: 800; font-size: 18px; }
          @media print { .no-print { display: none; } body { padding: 0; } .invoice-container { border: none; } }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 20px;" class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print Invoice</button>
        </div>
        <div class="invoice-container">
          <div class="header">
            <div class="logo"><h1>GIFTNGIFTS</h1><p>Seller Statement</p></div>
            <div class="invoice-info">
                <h2 style="font-size: 32px; font-weight: 900; letter-spacing: -1px;">INVOICE</h2>
                <p style="font-size: 14px; color: #64748b;"># ${invoiceNumber}</p>
            </div>
          </div>
          <div class="parties">
            <div><p class="party-label">Issued By</p><p><strong>GiftNGifts platform</strong></p><p>Tax Invoice / Statement</p></div>
            <div style="text-align: right;"><p class="party-label">For Transaction</p><p><strong>${txn.customer || txn.description}</strong></p><p>Date: ${invoiceDate}</p></div>
          </div>
          <table class="details-table">
            <thead><tr><th>Description</th><th>Type</th><th style="text-align: right;">Amount</th></tr></thead>
            <tbody><tr><td>${txn.description || 'Transaction Item'}</td><td style="text-transform: capitalize;">${txn.type}</td><td style="text-align: right; font-weight: 700;">₹${(txn.amount || 0).toLocaleString('en-IN')}</td></tr></tbody>
          </table>
          <div class="totals">
            <div class="totals-row"><span>Subtotal</span><span>₹${(txn.amount || 0).toLocaleString('en-IN')}</span></div>
            <div class="totals-row grand-total"><span>Total</span><span style="color: ${isCredit ? '#10b981' : '#f43f5e'}">${isCredit ? '+' : '-'}₹${(txn.amount || 0).toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </body>
      </html>
    `;

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };

  const stats = {
    totalCredit: data.transactions.filter(t => t.type === 'order' || t.type === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalDebit: data.transactions.filter(t => t.type === 'refund' || t.type === 'commission' || t.type === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalRefunds: data.transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalCommission: data.transactions.filter(t => t.type === 'commission').reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <MdHistory className="text-indigo-600" /> Transaction Ledger
          </h1>
          <p className="text-slate-500 font-medium">Monitor your cash flow and download invoices</p>
        </div>
        
        <button
          onClick={() => exportToExcel(data.transactions, `transactions_${typeFilter}`, TRANSACTION_EXPORT_COLUMNS)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <FiDownload className="text-lg text-indigo-600" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            label="Total Credits" 
            value={formatINR(stats.totalCredit)} 
            icon={<MdOutlineArrowUpward />} 
            color="emerald" 
            sub="Gross income"
        />
        <StatCard 
            label="Total Debits" 
            value={`-${formatINR(stats.totalDebit)}`} 
            icon={<MdOutlineArrowDownward />} 
            color="rose" 
            sub="Fees & Refunds"
        />
        <StatCard 
            label="Total Refunds" 
            value={formatINR(stats.totalRefunds)} 
            icon={<MdHistory />} 
            color="slate" 
            sub="Returned orders"
        />
        <StatCard 
            label="Commission" 
            value={formatINR(stats.totalCommission)} 
            icon={<MdReceipt />} 
            color="amber" 
            sub="Platform usage"
        />
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1 group">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search customer, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700 outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
          <div className="relative flex-1 md:flex-none">
            <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="w-full md:w-48 pl-12 pr-8 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-600 appearance-none cursor-pointer outline-none"
            >
                <option value="all">All Types</option>
                <option value="order">Orders Only</option>
                <option value="refund">Refunds</option>
                <option value="commission">Fees</option>
                <option value="payout">Payouts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="animate-spin w-10 h-10 border-[4px] border-indigo-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Transactions</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                <MdHistory size={48} />
            </div>
            <h3 className="font-bold text-slate-800">No records found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tracking ID</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((txn, i) => {
                  const isCredit = txn.type === 'order' || txn.type === 'credit';
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(txn.date).getFullYear()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getTypeBadge(txn.type)}`}>
                                {txn.type}
                            </span>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">{txn.description || txn.customer}</p>
                                {txn.email && <p className="text-[11px] text-slate-400 font-medium">{txn.email}</p>}
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-semibold">
                            {txn.orderId ? `#${txn.orderId.slice(-8).toUpperCase()}` : 'INTERNAL'}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-base">
                        <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                            {isCredit ? '+' : '-'}{formatINR(txn.amount)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                            {txn.orderId ? (
                            <button
                                onClick={() => handleDownloadInvoice(txn)}
                                className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                title="Generate Invoice"
                            >
                                <FiExternalLink strokeWidth={3} size={14} />
                            </button>
                            ) : '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Improved Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-slate-50/50 gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing page {data.pagination.currentPage} of {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft strokeWidth={3} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Legend Section */}
      <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-6 md:p-8">
        <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-6">Financial Legend</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <LegendItem color="emerald" label="Orders" sub="Sale proceeds" />
            <LegendItem color="rose" label="Refunds" sub="Customer returns" />
            <LegendItem color="amber" label="Commissions" sub="Platform fee" />
            <LegendItem color="blue" label="Payouts" sub="Bank transfers" />
        </div>
      </div>
    </div>
  );
}

// Helper Components
const StatCard = ({ label, value, icon, color, sub }) => {
    const colors = {
        emerald: 'bg-emerald-500 shadow-emerald-100 text-emerald-500',
        rose: 'bg-rose-500 shadow-rose-100 text-rose-500',
        amber: 'bg-amber-500 shadow-amber-100 text-amber-500',
        slate: 'bg-slate-700 shadow-slate-100 text-slate-700'
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`p-3 rounded-2xl text-white ${colors[color].split(' ')[0]} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate">{value}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic tracking-tighter">{sub}</p>
        </div>
    );
};

const LegendItem = ({ color, label, sub }) => {
    const bgs = { emerald: 'bg-emerald-500', rose: 'bg-rose-500', amber: 'bg-amber-500', blue: 'bg-blue-500' };
    return (
        <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${bgs[color]} animate-pulse`}></span>
            <div>
                <p className="text-sm font-black text-slate-800 leading-none mb-1">{label}</p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">{sub}</p>
            </div>
        </div>
    );
};

export default Transactions;