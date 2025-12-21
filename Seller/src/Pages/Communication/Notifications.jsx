import React, { useEffect, useMemo, useState } from 'react';
import api from "../../utils/api";
import { FiBell, FiAlertTriangle, FiCheckCircle, FiRefreshCcw } from 'react-icons/fi';

const severityPalette = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  critical: 'border-rose-200 bg-rose-50 text-rose-900'
};

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const formatRelative = (value) => {
  if (!value) return '—';
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState('');
  const [error, setError] = useState('');


  const fetchNotifications = async () => {
    try {
      // Auth check handled by interceptors

      setLoading(true);
      setError('');

      const { data } = await api.get(
        '/api/seller/notifications',
        {
          params: { status: filter }
        }
      );

      if (data.success) {
        setNotifications(data.notifications || []);
        setStats(data.stats || { total: 0, unread: 0 });
      }
    } catch (err) {
      console.error('Notification fetch failed', err);
      setError('Could not load notifications right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleMarkRead = async (id) => {
    if (!id || markingId === id) return;
    try {
      setMarkingId(id);
      await api.put(
        `/api/seller/notifications/${id}/read`,
        {}
      );
      setNotifications((prev) => prev.map((item) => item._id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item));
      setStats((prev) => ({ ...prev, unread: Math.max(0, (prev.unread || 0) - 1) }));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    } finally {
      setMarkingId('');
    }
  };

  const filteredNotifications = useMemo(() => notifications, [notifications]);

  const heroAccent = stats.unread ? 'from-amber-500/90 via-orange-500 to-rose-500' : 'from-sky-600 via-blue-600 to-indigo-600';

  return (
    <section className="space-y-6">
      <div className={`rounded-2xl p-6 text-white bg-gradient-to-r ${heroAccent} shadow-xl`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs font-semibold opacity-80">Seller health</p>
            <h1 className="text-2xl font-black mt-1">Activity & alerts</h1>
            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Stay active by adding new listings regularly. We will remind you if your storefront stays quiet for too long.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-3xl font-extrabold">{stats.unread || 0}</p>
              <p className="text-xs uppercase tracking-widest">Unread</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3">
              <p className="text-3xl font-extrabold">{stats.total || 0}</p>
              <p className="text-xs uppercase tracking-widest">Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === option ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {option === 'all' ? 'All alerts' : option === 'unread' ? 'Unread only' : 'Read history'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-rose-600 font-medium">{error}</span>}
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-semibold hover:border-slate-400"
          >
            <FiRefreshCcw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading && (
          <div className="border border-slate-200 rounded-2xl p-6 animate-pulse bg-white">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="border border-dashed border-slate-300 rounded-2xl p-10 bg-white text-center">
            <FiCheckCircle className="mx-auto text-4xl text-emerald-500 mb-3" />
            <p className="text-lg font-semibold text-slate-700">You are all caught up</p>
            <p className="text-sm text-slate-500">Add a new product listing to keep your shop active.</p>
          </div>
        )}

        {filteredNotifications.map((notification) => {
          const palette = severityPalette[notification.severity] || severityPalette.info;
          const isUnread = !notification.isRead;
          const inactivityDays = notification.metadata?.inactivityDays;

          return (
            <article
              key={notification._id}
              className={`border rounded-2xl p-5 bg-white shadow-sm ${palette} ${isUnread ? 'ring-2 ring-offset-2 ring-amber-200' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.severity === 'critical' ? <FiAlertTriangle className="text-rose-500" size={20} /> : <FiBell className="text-slate-600" size={20} />}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] font-semibold text-slate-500">{notification.category}</p>
                    <h2 className="text-xl font-bold text-slate-900">{notification.title}</h2>
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed">{notification.message}</p>
                    <div className="text-xs text-slate-600 mt-3 flex flex-wrap gap-4">
                      <span>Sent {formatRelative(notification.createdAt)} · {formatDate(notification.createdAt)}</span>
                      {typeof inactivityDays === 'number' && (
                        <span>Inactive for {inactivityDays} days</span>
                      )}
                    </div>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={() => handleMarkRead(notification._id)}
                    disabled={markingId === notification._id}
                    className="px-4 py-2 rounded-full bg-white text-slate-900 font-semibold text-sm shadow hover:shadow-md disabled:opacity-50"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Notifications;
