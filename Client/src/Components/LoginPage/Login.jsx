import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendurl, setIsLoggedin, setUserdata, userData } = useContext(AppContext);

  const [state, setState] = useState("Login"); // Login or Sign Up
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOtpPage, setIsOtpPage] = useState(false); // OTP screen toggle

  const inputRefs = useRef([]);

  // Reset form when switching between Login and Sign Up
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setIsOtpPage(false);
    // Ensure inputRefs exist before clearing
    inputRefs.current.forEach((input) => { if(input) input.value = "" });
  }, [state]);

  // Focus handling for OTP fields
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    const lastIdx = Math.min(pasteArray.length - 1, 5);
    if (lastIdx >= 0 && inputRefs.current[lastIdx]) {
      inputRefs.current[lastIdx].focus();
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendurl}/api/auth/register`, {
          name, email, password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setIsLoggedin(true);
          if (data.user) {
            setUserdata({ id: data.user.id, name: data.user.name, email: data.user.email });
          }
          toast.success("Account created successfully!");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendurl}/api/auth/login`, {
          email, password,
        });

        if (data.success) {
          setIsOtpPage(true);
          toast.success("OTP sent to your email.");
          setPassword("");
          setTimeout(() => {
            if (inputRefs.current[0]) inputRefs.current[0].focus();
          }, 100);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((input) => input?.value.trim());
      const otp = otpArray.join("");

      if (!/^\d{6}$/.test(otp)) {
        toast.error("Please enter a valid 6-digit OTP.");
        return;
      }

      const { data } = await axios.post(`${backendurl}/api/auth/verify-login-otp`, { email, otp });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setIsLoggedin(true);
        if (data.user) {
          setUserdata({ id: data.user.id, name: data.user.name, email: data.user.email });
        }
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isOtpPage ? "Verify Identity" : state === "Sign Up" ? "Get Started" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isOtpPage 
              ? `Enter the code sent to ${email}` 
              : state === "Sign Up" ? "Create an account to join us" : "Please enter your details"}
          </p>
        </div>

        {isOtpPage ? (
          /* OTP Verification Form */
          <form onSubmit={verifyOtpHandler} className="mt-8 space-y-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {Array(6).fill(0).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  required
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#fb541b] focus:ring-2 focus:ring-[#fb541b]/20 outline-none transition-all"
                />
              ))}
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#fb541b] hover:bg-[#e04818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fb541b] transition-colors"
            >
              Verify & Login
            </button>
            <button 
              type="button" 
              onClick={() => setIsOtpPage(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Login
            </button>
          </form>
        ) : (
          /* Login / Sign Up Form */
          <form onSubmit={onSubmitHandler} className="mt-8 space-y-5">
            <div className="space-y-4">
              {state === "Sign Up" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase ml-1 mb-1">Full Name</label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fb541b]/20 focus:border-[#fb541b] transition-all"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase ml-1 mb-1">Email Address</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fb541b]/20 focus:border-[#fb541b] transition-all"
                  type="email"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                   <label className="block text-xs font-semibold text-gray-500 uppercase ml-1">Password</label>
                   {state === "Login" && (
                    <span 
                      onClick={() => navigate("/Reset_pass")}
                      className="text-xs font-semibold text-[#fb541b] cursor-pointer hover:underline"
                    >
                      Forgot?
                    </span>
                   )}
                </div>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fb541b]/20 focus:border-[#fb541b] transition-all"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#fb541b] hover:bg-[#e04818] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fb541b] transition-all transform active:scale-[0.98]"
            >
              {state === "Login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        {!isOtpPage && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {state === "Sign Up" ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setState(state === "Login" ? "Sign Up" : "Login")}
                className="font-bold text-[#fb541b] hover:text-[#e04818] transition-colors"
              >
                {state === "Login" ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;