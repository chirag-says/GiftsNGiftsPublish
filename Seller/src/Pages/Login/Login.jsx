import React, { useContext, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Admincontext } from '../../Components/context/admincontext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';

// SECURITY: Ensure axios sends cookies with every request


function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [isOtpScreen, setIsOtpScreen] = useState(false);

    // Forgot Password States
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [nickName, setNickName] = useState('');
    const [phone, setPhone] = useState('');

    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');

    // Use onLoginSuccess instead of setatoken
    const { onLoginSuccess } = useContext(Admincontext);
    const navigate = useNavigate();

    // ========================= FORGOT PASSWORD HANDLERS =========================

    // Step 1: Request OTP
    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post("/api/seller/forgot-password", { email });
            if (data.success) {
                toast.success(data.message || "OTP sent to your email");
                setForgotPasswordStep(2);
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Reset Password with OTP
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!resetOtp || !newPassword || !confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post("/api/seller/reset-password", {
                email,
                otp: resetOtp,
                newPassword
            });

            if (data.success) {
                toast.success(data.message || "Password reset successfully!");
                // Reset all forgot password states
                setIsForgotPassword(false);
                setForgotPasswordStep(1);
                setResetOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setEmail('');
            } else {
                toast.error(data.message || "Failed to reset password");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Back to Login from Forgot Password
    const handleBackToLogin = () => {
        setIsForgotPassword(false);
        setForgotPasswordStep(1);
        setResetOtp('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // Registration handler
    const registerSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post("/api/seller/register", {
                name, email, password, nickName, phone, street, city, state, pincode
            });
            if (data.success) {
                toast.success(data.message);
                setIsOtpScreen(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        }
    };

    // OTP verification handler
    const verifyOtp = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post("/api/seller/verify-otp", {
                email, otp
            });
            if (data.success) {
                // Token is set via HttpOnly cookie by server
                // Use onLoginSuccess to update context state
                onLoginSuccess(data.user);
                navigate("/seller-profile");
                toast.success("OTP verified, login success");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "OTP verification failed");
        }
    };

    // Login handler
    const loginSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post("/api/seller/login", {
                email, password
            });
            if (data.success) {
                // Token is set via HttpOnly cookie by server
                // Use onLoginSuccess to update context state
                onLoginSuccess(data.user);
                navigate("/");
                toast.success("Login successful");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        }
    };
    // ------------------------------------------

    // Helper function for input classes (Padding reduced from p-3 to p-2.5 for smaller height)
    const inputClass = "w-full p-2 bg-white border border-gray-300 text-gray-900 rounded-lg shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 outline-none transition duration-150 placeholder:text-gray-500";
    const buttonClass = "w-full bg-indigo-600 hover:bg-indigo-700 transition duration-300 text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-[1.01]";

    return (
        <form className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-xl bg-white p-8 md:p-10 shadow-2xl rounded-2xl border-t-4 border-indigo-600">

                {/* Header Section */}
                <div className="text-center mb-8">
                    {isForgotPassword ? (
                        <KeyRound className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                    ) : isOtpScreen ? (
                        <ShieldCheck className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                    ) : (
                        <Store className="mx-auto h-12 w-12 text-indigo-600 mb-2" />
                    )}
                    <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
                        {isForgotPassword
                            ? (forgotPasswordStep === 1 ? "Forgot Password" : "Reset Password")
                            : isOtpScreen
                                ? "Verify Your Account"
                                : (isRegister ? "Become a Partner Seller" : "Seller Portal Login")}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isForgotPassword
                            ? (forgotPasswordStep === 1
                                ? "Enter your registered email to receive a reset OTP."
                                : "Enter the OTP and your new password.")
                            : isOtpScreen
                                ? "Enter the 6-digit OTP sent to your email."
                                : (isRegister ? "Enter your details to create your selling profile." : "Access your dashboard.")}
                    </p>
                </div>

                {/* --- MAIN FORM CONTENT --- */}

                {/* FORGOT PASSWORD SCREEN */}
                {isForgotPassword ? (
                    <>
                        {forgotPasswordStep === 1 ? (
                            /* Step 1: Enter Email */
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="forgot-email" className="sr-only">Email Address</label>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            className={inputClass}
                                            placeholder="Enter your registered email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    className={`${buttonClass} mt-6`}
                                    onClick={handleForgotPasswordRequest}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Sending OTP..." : "Send Reset OTP"}
                                </button>
                            </>
                        ) : (
                            /* Step 2: Enter OTP & New Password */
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="reset-otp" className="sr-only">Reset OTP</label>
                                        <input
                                            id="reset-otp"
                                            className={`${inputClass} text-center text-xl tracking-widest`}
                                            placeholder="6-Digit OTP"
                                            value={resetOtp}
                                            onChange={(e) => setResetOtp(e.target.value)}
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    <div className="relative">
                                        <label htmlFor="new-password" className="sr-only">New Password</label>
                                        <input
                                            id="new-password"
                                            type={showNewPassword ? "text" : "password"}
                                            className={inputClass}
                                            placeholder="New Password (min 8 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-indigo-600 transition"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </span>
                                    </div>

                                    <div>
                                        <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            className={inputClass}
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    className={`${buttonClass} mt-6`}
                                    onClick={handleResetPassword}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </button>

                                {/* Resend OTP Option */}
                                <p className="mt-4 text-center text-gray-500 text-sm">
                                    Didn't receive the OTP?{" "}
                                    <span
                                        className="text-indigo-600 font-bold cursor-pointer hover:text-indigo-800 hover:underline transition duration-200"
                                        onClick={() => {
                                            setForgotPasswordStep(1);
                                            setResetOtp('');
                                        }}
                                    >
                                        Resend OTP
                                    </span>
                                </p>
                            </>
                        )}

                        {/* Back to Login Link */}
                        <p className="mt-6 text-center">
                            <span
                                className="inline-flex items-center gap-1 text-gray-600 cursor-pointer hover:text-indigo-600 transition duration-200"
                                onClick={handleBackToLogin}
                            >
                                <ArrowLeft size={16} />
                                Back to Login
                            </span>
                        </p>
                    </>
                ) : isOtpScreen ? (
                    <>
                        <label htmlFor="otp-input" className="sr-only">One-Time Password (OTP)</label>
                        <input
                            id="otp-input"
                            className={`${inputClass} mb-6 text-center text-xl tracking-widest`}
                            placeholder="6-Digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                        />

                        <button
                            className={buttonClass}
                            onClick={verifyOtp}
                            type="submit"
                        >
                            Confirm Verification
                        </button>
                    </>
                ) : (
                    <>
                        {isRegister && (
                            <div className="space-y-6 ">
                                {/* Owner & Brand Fieldset */}
                                <fieldset className="p-0 m-0 border-none space-y-4">
                                    <legend className="text-sm font-semibold text-gray-700 mb-2">Owner & Brand Information</legend>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="full-name" className="sr-only">Full Name (Owner)</label>
                                            <input
                                                id="full-name"
                                                className={inputClass}
                                                placeholder="Full Name (Owner)"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="brand-name" className="sr-only">Brand Name</label>
                                            <input
                                                id="brand-name"
                                                className={inputClass}
                                                placeholder="Brand Name"
                                                value={nickName}
                                                onChange={(e) => setNickName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="sr-only">Phone Number</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            className={inputClass}
                                            placeholder="Phone Number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </fieldset>

                                {/* Address Fieldset */}
                                <fieldset className="border-t border-gray-100 space-y-4">
                                    <legend className="text-sm font-semibold text-gray-700 ">Primary Business Address</legend>

                                    <div>
                                        <label htmlFor="street" className="sr-only">Street Address</label>
                                        <input
                                            id="street"
                                            className={inputClass}
                                            placeholder="Street Address / Locality"
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="city" className="sr-only">City</label>
                                            <input
                                                id="city"
                                                className={inputClass}
                                                placeholder="City"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="state" className="sr-only">State</label>
                                            <input
                                                id="state"
                                                className={inputClass}
                                                placeholder="State"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="pincode" className="sr-only">Pincode</label>
                                            <input
                                                id="pincode"
                                                type="number"
                                                className={inputClass}
                                                placeholder="Pincode"
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        )}

                        {/* Login/Registration Common Fields */}
                        <div className={`space-y-4 ${isRegister ? 'mt-6' : ''}`}>
                            <div>
                                <label htmlFor="email" className="sr-only">Email Address</label>
                                <input
                                    id="email"
                                    className={inputClass}
                                    placeholder="Business Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* PASSWORD */}
                            <div className="relative">
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className={inputClass}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <span
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-indigo-600 transition"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {/* Adjusted vertical alignment for smaller input height */}
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Forgot Password Link - Only show on Login, not Registration */}
                        {!isRegister && (
                            <div className="mt-2 text-right">
                                <span
                                    className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline transition duration-200"
                                    onClick={() => setIsForgotPassword(true)}
                                >
                                    Forgot Password?
                                </span>
                            </div>
                        )}


                        <button
                            className={`${buttonClass} ${isRegister ? 'mt-6' : 'mt-4'}`}
                            onClick={isRegister ? registerSubmit : loginSubmit}
                            type="submit"
                        >
                            {isRegister ? "Register & Verify Email" : "Sign In Securely"}
                        </button>

                        {/* Switch Link */}
                        <p className="mt-6 text-center text-gray-500 text-sm">
                            {isRegister ? "Already a verified partner?" : "Ready to join as a seller?"}{" "}
                            <span
                                className="text-indigo-600 font-bold cursor-pointer hover:text-indigo-800 hover:underline transition duration-200"
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    // Optional: Clear fields when switching forms for a clean start
                                    setPassword('');
                                    setStreet('');
                                    setCity('');
                                    setState('');
                                    setPincode('');
                                }}
                            >
                                {isRegister ? "Log In" : "Register Now"}
                            </span>
                        </p>
                    </>
                )}
            </div>
        </form>
    );
}

export default Login;