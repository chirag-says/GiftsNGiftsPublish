import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const { onLoginSuccess, isLoggedin } = useContext(AppContext);

  const [state, setState] = useState("Login"); // Login | Sign Up
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpPage, setIsOtpPage] = useState(false);
  const [lockedEmail, setLockedEmail] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setIsOtpPage(false);
    inputRefs.current.forEach((i) => i && (i.value = ""));
  }, [state]);

  useEffect(() => {
    if (isLoggedin) navigate(from, { replace: true });
  }, [isLoggedin, navigate, from]);

  // ================= SUBMIT =================
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === "Sign Up") {
        const { data } = await api.post("/api/auth/register", {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });

        if (data.success && data.requiresOtp) {
          const safeEmail = email.trim().toLowerCase();
          setLockedEmail(safeEmail); // 🔒 LOCK EMAIL
          setIsOtpPage(true);
          toast.success("OTP sent to your email. Please verify.");
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
      } else {
        // ✅ LOGIN — DIRECT LOGIN (NO OTP)
        const { data } = await api.post("/api/auth/login", {
          email: email.trim().toLowerCase(),
          password,
        });

        if (data.success) {
          onLoginSuccess(data.user);
          toast.success("Login successful");
          navigate(from, { replace: true });
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // ================= VERIFY OTP (SIGN UP ONLY) =================
  const verifyOtpHandler = async (e) => {
  e.preventDefault();

  const otp = inputRefs.current.map((i) => i?.value).join("");
  if (!/^\d{6}$/.test(otp)) {
    toast.error("Please enter a valid 6-digit OTP");
    return;
  }

  try {
    const { data } = await api.post(
      "/api/auth/verify-registration-otp",
      {
        email: lockedEmail,
        otp,
      }
    );

    if (data.success) {
      onLoginSuccess(data.user);
      toast.success("Account verified successfully");
      navigate(from, { replace: true });
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "OTP verification failed");
  }
};


  // ================= RESEND OTP (SIGN UP ONLY) =================
  const resendOtpHandler = async () => {
    if (!lockedEmail) {
      toast.error("Email missing. Please register again.");
      return;
    }

    try {
      const { data } = await api.post("/api/auth/resend-registration-otp", {
        email: lockedEmail,
      });

      if (data.success) {
        toast.success("OTP resent to your email");
        inputRefs.current.forEach((i) => i && (i.value = ""));
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    paste.split("").forEach((char, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = char;
      }
    });
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  return (
    <div className="flex items-center justify-center bg-slate-50 px-4 py-10 min-h-[80vh]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isOtpPage
              ? "Verify Identity"
              : state === "Sign Up"
                ? "Get Started"
                : "Welcome Back"}
          </h2>
        </div>

        {isOtpPage ? (
          <form onSubmit={verifyOtpHandler} className="space-y-6">
            <div
              className="flex justify-between gap-2"
              onPaste={handleOtpPaste}
            >
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    maxLength={1}
                    inputMode="numeric"
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#fb541b] outline-none"
                  />
                ))}
            </div>

            <button className="w-full py-3 bg-[#fb541b] text-white rounded-xl">
              Verify & Create Account
            </button>

            <button
              type="button" // ✅ THIS IS THE FIX
              onClick={resendOtpHandler}
              className="w-full text-[#fb541b] hover:text-orange-700 text-sm"
            >
              Resend OTP
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitHandler} className="space-y-5">
            {state === "Sign Up" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3 border rounded-xl"
              />
            )}

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-xl"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {/* 🔐 Reset password link */}
{state === "Login" && (
  <div className="flex justify-end">
    <button
      type="button"
      onClick={() => navigate("/reset-password")}
      className="text-sm text-[#fb541b] hover:text-orange-700 font-medium"
    >
      Forgot password?
    </button>
  </div>
)}

            <button className="w-full py-3 bg-[#fb541b] text-white rounded-xl">
              {state === "Login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        {!isOtpPage && (
          <p className="text-center text-sm">
            {state === "Login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              onClick={() => setState(state === "Login" ? "Sign Up" : "Login")}
              className="ml-2 text-[#fb541b] font-bold"
            >
              {state === "Login" ? "Sign up" : "Login"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
