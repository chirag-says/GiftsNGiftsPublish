import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 SAME LOGIC - DO NOT REMOVE
  const pendingCart = location.state?.pendingCart;
  const redirectTo = location.state?.redirectTo || "/";
  const { onLoginSuccess } = useContext(AppContext);

  const [state, setState] = useState("Login");
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

  // ================= SAME INTEGRATION LOGIC =================
  const handleAuthSuccess = async (user) => {
    onLoginSuccess(user);
    toast.success("Login successful");
    if (pendingCart) {
      try {
        await api.post("/api/auth/cart", {
          productId: pendingCart.productId,
          quantity: pendingCart.quantity || 1,
        });
      } catch {
        toast.error("Failed to add product to cart");
      }
    }
    navigate(redirectTo, { replace: true });
  };

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
          setLockedEmail(email.trim().toLowerCase());
          setIsOtpPage(true);
          toast.success("OTP sent to your email");
        }
      } else {
        const { data } = await api.post("/api/auth/login", {
          email: email.trim().toLowerCase(),
          password,
        });
        if (!data.success) {
          toast.error(data.message);
          return;
        }
        await handleAuthSuccess(data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    const otp = inputRefs.current.map((i) => i?.value).join("");
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      const { data } = await api.post("/api/auth/verify-registration-otp", {
        email: lockedEmail,
        otp,
      });
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      await handleAuthSuccess(data.user);
    } catch {
      toast.error("OTP verification failed");
    }
  };

  const resendOtpHandler = async () => {
    try {
      await api.post("/api/auth/resend-registration-otp", { email: lockedEmail });
      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    paste.split("").forEach((char, i) => {
      if (inputRefs.current[i]) inputRefs.current[i].value = char;
    });
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  return (
    <div className="flex items-center justify-center pb-6 pt-10 bg-[#fcfcf9] px-4 ">
      <div className="max-w-md w-full">
       
        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-stone-100">
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-8 text-center">
            {isOtpPage ? "Verify OTP" : state === "Login" ? "Sign In" : "Register"}
          </h2>

          {isOtpPage ? (
            <form onSubmit={verifyOtpHandler} className="space-y-6">
              <p className="text-center text-xs text-stone-500 mb-4">
                We've sent a 6-digit code to <br/>
                <span className="font-semibold text-stone-800">{lockedEmail}</span>
              </p>
              
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {Array(6).fill(0).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    maxLength={1}
                    inputMode="numeric"
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-12 h-14 text-center text-xl font-bold border border-stone-200 rounded-lg
                     focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none transition-all bg-stone-50"
                  />
                ))}
              </div>

              <button className="w-full py-3.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-bold tracking-widest uppercase text-xs transition-all shadow-lg shadow-stone-200">
                Verify & Continue
              </button>

              <button
                type="button"
                onClick={resendOtpHandler}
                className="w-full text-xs font-bold text-amber-700 hover:text-amber-800 tracking-wide uppercase"
              >
                Resend Code
              </button>
              
              <button 
                type="button" 
                onClick={() => setIsOtpPage(false)}
                className="flex items-center justify-center gap-2 w-full text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                <ArrowLeft size={14} /> Edit Email
              </button>
            </form>
          ) : (
            <form onSubmit={onSubmitHandler} className="space-y-5">
              {state === "Sign Up" && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400 ml-1 tracking-widest">Full Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanshu Sharma"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all text-sm"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400 ml-1 tracking-widest">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-400 ml-1 tracking-widest">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button className="w-full mt-4 py-3.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-bold tracking-widest uppercase text-xs transition-all shadow-lg shadow-stone-200">
                {state === "Login" ? "Sign In to Account" : "Create My Account"}
              </button>
            </form>
          )}

          {!isOtpPage && (
            <div className="mt-8 pt-6 border-t border-stone-100 text-center">
              <p className="text-sm text-stone-500">
                {state === "Login" ? "New to GiftsNGifts?" : "Already a member?"}
                <button
                  onClick={() => setState(state === "Login" ? "Sign Up" : "Login")}
                  className="ml-2 text-stone-900 font-bold hover:text-amber-700 transition-colors underline decoration-amber-200 underline-offset-4"
                >
                  {state === "Login" ? "Create Account" : "Sign In"}
                </button>
              </p>
            </div>
          )}
        </div>
        
        
      </div>
    </div>
  );
};

export default Login;