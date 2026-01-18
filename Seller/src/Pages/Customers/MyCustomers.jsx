import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatINR } from "../../utils/orderMetrics";
import { LuSearch, LuUsers, LuMail, LuPhone, LuDownload } from "react-icons/lu";
import { exportToExcel, CUSTOMER_EXPORT_COLUMNS } from "../../utils/exportUtils";

function MyCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/seller/customers/my-customers");
        if (res.data.success) setCustomers(res.data.customers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(filter.toLowerCase()) ||
    c.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
    <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-gray-100 p-6 sm:p-8">
  
  {/* Soft gradient background accents */}
  <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

  <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

    {/* Left: Title */}
    <div>
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
        My Customers
      </h1>
      <p className="text-sm text-gray-500 mt-1 max-w-md">
        People who have purchased from your store
      </p>
    </div>

    {/* Right: Actions */}
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

      {/* Export Button */}
      <button
        onClick={() =>
          exportToExcel(customers, "customers", CUSTOMER_EXPORT_COLUMNS)
        }
        className="
          inline-flex items-center justify-center gap-2
          px-5 py-2.5 rounded-xl
          bg-gradient-to-r from-indigo-600 to-purple-600
          text-white text-sm font-semibold
          shadow-md shadow-indigo-200
          hover:shadow-lg hover:from-indigo-500 hover:to-purple-500
          transition-all
        "
      >
        <LuDownload className="w-4 h-4" />
        Export
      </button>

      {/* Search Bar */}
      <div className="relative group w-full sm:w-64">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition" />

        <div className="relative flex items-center bg-white rounded-xl border border-gray-200 shadow-sm transition-all group-focus-within:border-transparent group-focus-within:ring-2 group-focus-within:ring-indigo-500/20">
          <LuSearch className="ml-3 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition" />
          <input
            type="text"
            placeholder="Search customers..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setFilter("");
              }
            }}
            className="
              w-full px-3 py-2.5
              bg-transparent text-sm font-medium
              text-gray-700 placeholder-gray-400
              border-none outline-none ring-0
            "
          />
        </div>
      </div>

    </div>
  </div>
</div>


      {/* Customers Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
              <span>Loading customers...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <LuUsers className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No customers found</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
  {/* Desktop Table View - Visible on MD and larger screens */}
  <div className="hidden md:block overflow-hidden bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50/50 border-b border-slate-100">
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Channels</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Orders</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Revenue Contribution</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Last Interaction</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {filtered.map((cust) => (
          <tr key={cust._id} className="group hover:bg-indigo-50/30 transition-all duration-300">
            <td className="px-8 py-5">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 shrink-0">
                  <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:rotate-6 transition-transform">
                    {cust.name?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div>
                  <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{cust.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {cust._id?.slice(-6)}</p>
                </div>
              </div>
            </td>
            <td className="px-8 py-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><LuMail size={12}/></div>
                  {cust.email}
                </div>
                {cust.phone && (
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><LuPhone size={12}/></div>
                    {cust.phone}
                  </div>
                )}
              </div>
            </td>
            <td className="px-8 py-5 text-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black bg-white border border-slate-100 shadow-sm text-slate-700 group-hover:border-indigo-200 transition-colors">
                {cust.totalOrders} <span className="ml-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Orders</span>
              </span>
            </td>
            <td className="px-8 py-5 text-center">
              <span className="text-lg font-black text-slate-900 tracking-tight group-hover:scale-110 transition-transform inline-block">
                {formatINR(cust.totalSpent)}
              </span>
            </td>
            <td className="px-8 py-5 text-right">
              <div className="flex flex-col items-end">
                <p className="text-sm font-black text-slate-700">
                  {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {new Date(cust.lastOrderDate).getFullYear()}
                </p>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Mobile Card View - Visible only on small screens */}
  <div className="grid grid-cols-1 gap-4 md:hidden">
    {filtered.map((cust) => (
      <div key={cust._id} className="bg-white p-6 rounded border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
            {cust.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{cust.name}</h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Ref ID: {cust._id?.slice(-8)}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <LuMail className="text-indigo-500" size={18} />
            <span className="text-sm font-bold text-slate-700 truncate">{cust.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100/50">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Lifetime Value</p>
            <p className="text-lg font-black text-slate-900 leading-none">{formatINR(cust.totalSpent)}</p>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/50 text-right">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Loyalty</p>
            <p className="text-lg font-black text-slate-900 leading-none">{cust.totalOrders} <span className="text-[10px] text-slate-400 uppercase">Sales</span></p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
          <span>Recent Activity</span>
          <span className="text-slate-700 italic">
            {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
        )}

        {/* Table Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{filtered.length}</span> of <span className="font-medium text-gray-700">{customers.length}</span> customers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCustomers;