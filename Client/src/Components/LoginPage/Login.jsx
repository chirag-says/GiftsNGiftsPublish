import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 DATA FROM PRODUCT PAGE
  const pendingCart = location.state?.pendingCart;
  const redirectTo = location.state?.redirectTo || "/";

  const { onLoginSuccess } = useContext(AppContext);

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

  // ================= AUTH SUCCESS (SINGLE SOURCE OF TRUTH) =================
  const handleAuthSuccess = async (user) => {
    onLoginSuccess(user);
    toast.success("Login successful");

    // 🛒 AUTO ADD TO CART
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

    // 🚀 FINAL REDIRECT
    navigate(redirectTo, { replace: true });
  };

  // ================= LOGIN / SIGNUP =================
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

  // ================= OTP VERIFY =================
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

  // ================= RESEND OTP =================
  const resendOtpHandler = async () => {
    try {
      await api.post("/api/auth/resend-registration-otp", {
        email: lockedEmail,
      });
      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend OTP");
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
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    paste.split("").forEach((char, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = char;
      }
    });

    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };


  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isOtpPage ? "Verify OTP" : state === "Login" ? "Welcome Back" : "Create Account"}
        </h2>

        {isOtpPage ? (
          <form onSubmit={verifyOtpHandler} className="space-y-6">
            <div
              className="flex justify-between gap-2"
              onPaste={handleOtpPaste}
            >
              {Array(6).fill(0).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  maxLength={1}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl
                   focus:border-[#fb541b] focus:outline-none transition"
                />
              ))}
            </div>

            <button className="w-full py-3 bg-[#fb541b] text-white rounded-xl font-semibold">
              Verify OTP
            </button>

            <button
              type="button"
              onClick={resendOtpHandler}
              className="w-full text-sm text-[#fb541b] hover:underline"
            >
              Resend OTP
            </button>
          </form>

        ) : (
          <form onSubmit={onSubmitHandler} className="space-y-4">
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button className="w-full py-3 bg-[#fb541b] text-white rounded-xl">
              {state === "Login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        {!isOtpPage && (
          <p className="text-center mt-4 text-sm">
            {state === "Login" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setState(state === "Login" ? "Sign Up" : "Login")}
              className="ml-2 text-[#fb541b] font-bold"
            >
              {state === "Login" ? "Sign Up" : "Login"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
