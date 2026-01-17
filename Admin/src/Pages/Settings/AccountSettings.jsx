import React, { useContext, useEffect, useState } from 'react';
import api from "../../utils/api";
import { Admincontext } from '../../Components/context/admincontext';
import { toast } from 'react-toastify';
import { FiSave, FiShield, FiUser } from 'react-icons/fi';
import { LuMail, LuClock3 } from 'react-icons/lu';

const Card = ({ title, icon, children, subtitle }) => (
  <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

function AccountSettings() {
  const { backendurl } = useContext(Admincontext);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [meta, setMeta] = useState({ createdAt: '', updatedAt: '' });
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/admin/account/profile', {
          signal: controller.signal
        });
        if (data.success) {
          setProfileForm({
            name: data.admin?.name || '',
            email: data.admin?.email || ''
          });
          setMeta({
            createdAt: data.admin?.createdAt,
            updatedAt: data.admin?.updatedAt
          });
          if (data.admin?.name) {
            localStorage.setItem('adminName', data.admin.name);
          }
        }
      } catch (error) {
        if (error.name !== 'CanceledError' && !error.message?.includes('canceled')) {
          console.error('Profile fetch failed', error);
          toast.error(error.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [backendurl]);

  const onProfileChange = ({ target }) => {
    setProfileForm((prev) => ({ ...prev, [target.name]: target.value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    try {
      setSavingProfile(true);
      const { data } = await api.put('/api/admin/account/profile', profileForm);
      if (data.success) {
        toast.success('Profile updated');
        if (data.admin?.name) {
          localStorage.setItem('adminName', data.admin.name);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSecuritySave = async (event) => {
    event.preventDefault();
    if (!securityForm.newPassword) {
      return toast.error('Enter a new password to continue');
    }
    if (securityForm.newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setSavingSecurity(true);
      const payload = {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      };
      const { data } = await api.put('/api/admin/account/profile', payload);
      if (data.success) {
        toast.success('Password updated');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update password');
    } finally {
      setSavingSecurity(false);
    }
  };

  const shortDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-wrap gap-6 items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Profile</p>
          <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-500 max-w-2xl">Update your admin identity, contact email, and password used to access the control room.</p>
        </div>
        <div className="flex flex-col text-sm text-slate-500 gap-1">
          <span className="inline-flex items-center gap-2"><LuMail /> {profileForm.email || '—'}</span>
          <span className="inline-flex items-center gap-2"><LuClock3 /> Last updated {shortDate(meta.updatedAt)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Basic Information" subtitle="Identity" icon={<FiUser />}>
          <form className="space-y-4" onSubmit={handleProfileSave}>
            <div>
              <label className="text-sm font-semibold text-slate-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={onProfileChange}
                disabled={loading}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Admin name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Email Address</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={onProfileChange}
                disabled={loading}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="admin@gnghq.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile || loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-2xl py-3 font-semibold hover:bg-slate-800 disabled:opacity-60"
            >
              <FiSave /> {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </Card>

        <Card title="Security" subtitle="Password" icon={<FiShield />}>
          <form className="space-y-4" onSubmit={handleSecuritySave}>
            <div>
              <label className="text-sm font-semibold text-slate-600">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={securityForm.currentPassword}
                onChange={(e) => setSecurityForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={securityForm.newPassword}
                onChange={(e) => setSecurityForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={securityForm.confirmPassword}
                onChange={(e) => setSecurityForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Repeat password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingSecurity}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-2xl py-3 font-semibold hover:bg-indigo-500 disabled:opacity-60"
            >
              <FiShield /> {savingSecurity ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </Card>
      </div>

      <div className="text-xs text-slate-400 text-center">
        Created {shortDate(meta.createdAt)} · Secure account management
      </div>
    </div>
  );
}

export default AccountSettings;
