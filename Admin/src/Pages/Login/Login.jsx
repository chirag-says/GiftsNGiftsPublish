import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Admincontext } from '../../Components/context/admincontext';
import { FiEye, FiEyeOff, FiLock, FiMail, FiShield } from 'react-icons/fi';

function Login() {
  const { backendurl, setatoken } = useContext(Admincontext);
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setFormValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError('');

      const { data } = await axios.post(`${backendurl}/api/admin/login`, {
        email: formValues.email,
        password: formValues.password
      });

      if (!data.success) {
        setError(data.message || 'Unable to login');
        toast.error(data.message || 'Unable to login');
        return;
      }

      localStorage.setItem('atoken', data.token);
      if (data.user?.name) {
        localStorage.setItem('adminName', data.user.name);
      } else {
        localStorage.removeItem('adminName');
      }
      setatoken(data.token);
      toast.success('Welcome back, Admin');
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message || 'Server error. Please retry.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

        {/* LEFT BRAND PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.45em] text-white/80">
              <FiShield /> Secure Admin Access
            </span>

            <h1 className="text-4xl font-black leading-tight mt-8">
              GNG  
              <br />Admin Console
            </h1>

            <p className="text-sm text-white/90 mt-6 max-w-sm">
              Centralized control panel to manage listings, users, analytics, and system health.
            </p>
          </div>

          <div className="space-y-3 text-sm text-white/90">
            <p>• Real-time platform insights</p>
            <p>• Role-based administration</p>
            <p>• Secure access logging</p>
          </div>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div className="p-10 sm:p-12">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.5em] text-slate-400">
              Admin Login
            </p>
            <h2 className="text-3xl font-black text-slate-900 mt-3">
              Sign in to your account
            </h2>
            <p className="text-sm text-slate-500 mt-3 max-w-md">
              Enter your credentials to access the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FiMail className="text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="admin@gnghq.com"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FiLock className="text-slate-400" /> Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700 transition"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Login activity is monitored for security purposes.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 text-lg font-semibold text-white
                         shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Login to Dashboard'}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-8 text-center">
            Trouble signing in? Contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
