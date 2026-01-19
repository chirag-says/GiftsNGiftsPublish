import React, { useState, useRef, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, KeyRound, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle OTP Input focus shift
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (val && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;
    
    const digits = data.split("");
    digits.forEach((digit, i) => {
      if (otpRefs.current[i]) {
        otpRefs.current[i].value = digit;
      }
    });
    otpRefs.current[digits.length - 1]?.focus();
  };

  // ================= API ACTIONS =================

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/send-reset-otp", { email });
      if (data.success) {
        toast.success("OTP sent to your email");
        setStep(2);
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    const value = otpRefs.current.map((i) => i?.value).join("");
    if (value.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }
    setOtp(value);
    setStep(3);
  };

  const resetPassword = async (e) => {
  e.preventDefault();

  if (password.length < 8) {
    toast.error("Password must be at least 8 characters");
    return;
  }

  const safeEmail = email.trim().toLowerCase();

  setLoading(true);
  try {
    const { data } = await api.post("/api/auth/reset-password", {
      email: safeEmail,
      otp,
      newpassword: password,
    });

    if (data.success) {
      toast.success("Password reset successful. Please login.");
      navigate("/login");
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "OTP expired or invalid");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="py-10 flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-6">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-orange-600" size={30} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
              <p className="text-gray-500 mt-2">Enter your email to receive a reset code.</p>
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send OTP"} <ChevronRight size={18} />
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-6">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="text-orange-600" size={30} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
              <p className="text-gray-500 mt-2">We sent a 6-digit code to {email}</p>
            </div>

            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {Array(6).fill(0).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-12 h-14 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                />
              ))}
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors">
              Verify Code
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full text-sm text-gray-500 hover:text-orange-600 transition-colors"
            >
              Change Email
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={resetPassword} className="space-y-6">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-orange-600" size={30} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Set New Password</h2>
              <p className="text-gray-500 mt-2">Must be at least 8 characters long.</p>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="New Password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;