import React, { useState, useEffect } from "react";
import { FaUnlock, FaBan, FaCheckCircle, FaUserCircle, FaSearch, FaEnvelope, FaPhone } from "react-icons/fa";
import { toast } from 'react-toastify';
import api from "../../utils/api";
import { CircularProgress } from "@mui/material";

function UsersList({ type }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isBlockedPage = type === 'blocked';
  const pageTitle = isBlockedPage ? "Blocked Users" : "Registered Customers";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/users");
      if (response.data.success) {
        let fetchedUsers = response.data.users || [];
        if (isBlockedPage) {
          fetchedUsers = fetchedUsers.filter(u => u.isBlocked === true);
        }
        setUsers(fetchedUsers);
      } else {
        toast.error("Failed to fetch users.");
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [type]);

  const handleToggleBlock = async (userId, currentStatus) => {
    const action = currentStatus ? "Unblock" : "Block";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const response = await api.put(`/api/admin/toggle-user-block/${userId}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden my-4 mx-2 sm:mx-4">
      {/* Header Section - Stacked on Mobile, Row on Desktop */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 sm:px-6 py-6 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-white/20 rounded-lg shrink-0">
            {isBlockedPage ? <FaBan className="text-xl" /> : <FaUserCircle className="text-xl" />}
          </div>
          <div>
            <h2 className="text-xl font-bold">{pageTitle}</h2>
            <p className="text-xs text-cyan-100">Manage your user database</p>
          </div>
        </div>

        {/* Search Bar - Full Width on Mobile */}
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search ID, Name or Email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-gray-700 focus:outline-none shadow-inner border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center"><CircularProgress /></div>
      ) : (
        <>
          {/* Mobile View: Cards (Hidden on Desktop) */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user._id} className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 leading-tight">{user.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-mono tracking-tighter">ID: {user._id.slice(-8)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.isBlocked ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                       {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2 truncate"><FaEnvelope className="text-gray-400" /> {user.email}</div>
                    {user.phone && <div className="flex items-center gap-2"><FaPhone className="text-gray-400" /> {user.phone}</div>}
                  </div>

                  <button
                    onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                    className={`w-full py-2 rounded-lg text-xs font-black uppercase tracking-widest text-white transition-all shadow-md active:scale-95 ${user.isBlocked ? "bg-emerald-500" : "bg-rose-500"}`}
                  >
                    {user.isBlocked ? "Unblock Access" : "Restrict Access"}
                  </button>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-gray-400">No users found.</p>
            )}
          </div>

          {/* Desktop View: Table (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-black border-b tracking-widest">
                <tr>
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Contact Detail</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:scale-110 transition-transform">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{user.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-mono tracking-tighter mt-1">ID: {user._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.isBlocked ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <FaEnvelope className="text-xs text-slate-300" /> {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                              <FaPhone className="text-xs text-slate-300" /> {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm text-white active:scale-95 ${user.isBlocked ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100" : "bg-rose-500 hover:bg-rose-600 shadow-rose-100"}`}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">User records empty</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default UsersList;