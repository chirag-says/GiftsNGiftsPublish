import React, { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Admincontext } from '../../Components/context/admincontext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, ShieldCheck } from 'lucide-react';

// SECURITY: Ensure axios sends cookies with every request
axios.defaults.withCredentials = true;

function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [isOtpScreen, setIsOtpScreen] = useState(false);

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
    const { backendurl, onLoginSuccess } = useContext(Admincontext);
    const navigate = useNavigate();

    // Registration handler
    const registerSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(backendurl + "/api/seller/register", {
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
            const { data } = await axios.post(backendurl + "/api/seller/verify-otp", {
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
            const { data } = await axios.post(backendurl + "/api/seller/login", {
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
                    {isOtpScreen ? (
                        <ShieldCheck className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                    ) : (
                        <Store className="mx-auto h-12 w-12 text-indigo-600 mb-2" />
                    )}
                    <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
                        {isOtpScreen ? "Verify Your Account" : (isRegister ? "Become a Partner Seller" : "Seller Portal Login")}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isOtpScreen ? "Enter the 6-digit OTP sent to your email." : (isRegister ? "Enter your details to create your selling profile." : "Access your dashboard.")}
                    </p>
                </div>

                {/* --- MAIN FORM CONTENT --- */}

                {/* OTP SCREEN */}
                {isOtpScreen ? (
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


                        <button
                            className={`${buttonClass} mt-6`}
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