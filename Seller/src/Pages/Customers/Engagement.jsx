import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatINR } from "../../utils/orderMetrics";
import { LuSearch, LuUsers, LuMail, LuPhone, LuDownload, LuFilter, LuCalendar } from "react-icons/lu";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Customers</h1>
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <LuUsers className="w-4 h-4" />
            Manage and analyze your customer base
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm"
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => exportToExcel(customers, 'customers', CUSTOMER_EXPORT_COLUMNS)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all shadow-sm"
          >
            <LuDownload className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">Fetching your community...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 mb-4">
              <LuUsers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No customers found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-1">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Profile</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((cust) => (
                    <tr key={cust._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                            {cust.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">{cust.name}</p>
                            <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-tighter">ID: {cust._id?.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <LuMail className="w-4 h-4 text-indigo-400" />
                            {cust.email}
                          </div>
                          {cust.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <LuPhone className="w-3.5 h-3.5 text-gray-400" />
                              {cust.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-bold text-gray-900">{formatINR(cust.totalSpent)}</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide">
                            {cust.totalOrders} Orders
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">Finalized Order</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((cust) => (
                <div key={cust._id} className="p-5 active:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                        {cust.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{cust.name}</h4>
                        <p className="text-xs text-gray-500">ID: #{cust._id?.slice(-6)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">{formatINR(cust.totalSpent)}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">{cust.totalOrders} Orders</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <LuMail className="w-4 h-4 opacity-70" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <LuCalendar className="w-3.5 h-3.5" />
                        Last active: {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      {cust.phone && (
                         <div className="flex items-center gap-2 text-xs text-gray-500">
                         <LuPhone className="w-3.5 h-3.5" />
                         {cust.phone}
                       </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- Footer --- */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-gray-900">{filtered.length}</span> results
            </p>
            <p className="text-xs text-gray-400 hidden sm:block">
              Total base: {customers.length} customers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCustomers;