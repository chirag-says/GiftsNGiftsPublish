import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatINR } from "../../utils/orderMetrics";
import { MdHistory, MdFilterList, MdSearch, MdDownload, MdReceipt } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiDownload } from "react-icons/fi";
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

  const getTypeColor = (type) => {
    switch (type) {
      case "order": case "credit": return "text-green-600";
      case "refund": case "debit": return "text-red-600";
      case "commission": return "text-orange-600";
      case "payout": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "order": return "bg-green-100 text-green-700";
      case "refund": return "bg-red-100 text-red-700";
      case "commission": return "bg-orange-100 text-orange-700";
      case "payout": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleDownloadInvoice = (txn) => {
    // Generate a proper invoice HTML and open in new window for printing
    const invoiceDate = new Date(txn.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f5f5f5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
          .logo h1 { color: #4F46E5; font-size: 28px; }
          .logo p { color: #666; font-size: 12px; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { color: #333; font-size: 24px; margin-bottom: 5px; }
          .invoice-info p { color: #666; font-size: 14px; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .party h3 { color: #333; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .party p { color: #666; font-size: 14px; line-height: 1.6; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .details-table th { background: #4F46E5; color: white; padding: 12px 15px; text-align: left; font-size: 14px; }
          .details-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
          .details-table tr:last-child td { border-bottom: none; }
          .totals { margin-left: auto; width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .totals-row.grand { border-top: 2px solid #333; border-bottom: none; font-weight: bold; font-size: 18px; padding-top: 15px; }
          .totals-row.grand .value { color: ${isCredit ? '#16a34a' : '#dc2626'}; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-credit { background: #dcfce7; color: #16a34a; }
          .status-debit { background: #fee2e2; color: #dc2626; }
          .print-btn { position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #4F46E5; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
          .print-btn:hover { background: #4338CA; }
          @media print { .print-btn { display: none; } body { padding: 0; background: white; } .invoice-container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
        <div class="invoice-container">
          <div class="header">
            <div class="logo">
              <h1>🎁 GiftNGifts</h1>
              <p>Premium Gifting Platform</p>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${invoiceDate}</p>
              <p><span class="status-badge ${isCredit ? 'status-credit' : 'status-debit'}">${txn.type.toUpperCase()}</span></p>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <h3>From</h3>
              <p><strong>GiftNGifts Seller Panel</strong></p>
              <p>Your Trusted E-Commerce Partner</p>
              <p>support@giftngifts.com</p>
            </div>
            <div class="party" style="text-align: right;">
              <h3>Transaction With</h3>
              <p><strong>${txn.customer || txn.description || 'Platform Transaction'}</strong></p>
              <p>${txn.email || ''}</p>
              ${txn.orderId ? `<p>Order ID: #${txn.orderId.slice(-8).toUpperCase()}</p>` : ''}
            </div>
          </div>
          
          <table class="details-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Order ID</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${txn.description || txn.customer || 'Transaction'}</td>
                <td><span style="text-transform: capitalize;">${txn.type}</span></td>
                <td>${txn.orderId ? '#' + txn.orderId.slice(-8).toUpperCase() : '-'}</td>
                <td style="text-align: right; color: ${isCredit ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                  ${isCredit ? '+' : '-'}₹${(txn.amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>₹${(txn.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="totals-row">
              <span>Platform Fee</span>
              <span>Included</span>
            </div>
            <div class="totals-row grand">
              <span>Total ${isCredit ? 'Credit' : 'Debit'}</span>
              <span class="value">${isCredit ? '+' : '-'}₹${(txn.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for using GiftNGifts!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p style="margin-top: 10px;">For queries, contact: support@giftngifts.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open invoice in new window
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
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500">Complete statement of all your transactions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportToExcel(data.transactions, `transactions_${typeFilter}`, TRANSACTION_EXPORT_COLUMNS)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            <MdDownload className="text-lg" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-5 text-white">
          <p className="text-sm opacity-80">Total Credits</p>
          <h3 className="text-2xl font-bold mt-1">{formatINR(stats.totalCredit)}</h3>
          <p className="text-xs mt-1 opacity-70">Order payments received</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Debits</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">-{formatINR(stats.totalDebit)}</h3>
          <p className="text-xs text-gray-400 mt-1">Refunds + Commission</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Refunds</p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">-{formatINR(stats.totalRefunds)}</h3>
          <p className="text-xs text-gray-400 mt-1">Returns processed</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">Commission Paid</p>
          <h3 className="text-2xl font-bold text-orange-600 mt-1">-{formatINR(stats.totalCommission)}</h3>
          <p className="text-xs text-gray-400 mt-1">Platform fees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search by customer, order ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Transactions</option>
            <option value="order">Orders</option>
            <option value="refund">Refunds</option>
            <option value="commission">Commissions</option>
            <option value="payout">Payouts</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <MdHistory className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Debit/Credit</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((txn, i) => {
                  const isCredit = txn.type === 'order' || txn.type === 'credit';
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(txn.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{txn.description || txn.customer}</p>
                        {txn.email && <p className="text-xs text-gray-400">{txn.email}</p>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {txn.orderId ? `#${txn.orderId.slice(-8).toUpperCase()}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getTypeBadge(txn.type)}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${getTypeColor(txn.type)}`}>
                        {isCredit ? '+' : '-'}{formatINR(txn.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {txn.orderId && (
                          <button
                            onClick={() => handleDownloadInvoice(txn)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download Invoice"
                          >
                            <FiDownload className="text-sm" />
                            Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {data.pagination.currentPage} of {data.pagination.totalPages} • {data.pagination.totalItems} transactions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h4 className="font-semibold text-blue-800 mb-2">📊 Transaction Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-blue-700">Orders - Credits from sales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-sm text-blue-700">Refunds - Returned orders</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-sm text-blue-700">Commission - Platform fees</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-sm text-blue-700">Payouts - Bank withdrawals</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
