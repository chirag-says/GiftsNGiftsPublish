import React, { useContext, useState } from 'react';
// Assuming you store backendurl in a context, otherwise replace with direct string
import { Admincontext } from '../../Components/context/admincontext'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Optional: for better alerts

function Login() {
  // State for toggling views: 'Login', 'Register', 'OTP'
  const [currentState, setCurrentState] = useState('Login'); 
  const [showPassword, setShowPassword] = useState(false);
  const { backendurl, setatoken } = useContext(Admincontext);
  const navigate = useNavigate();

  // Unified State for Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nickName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    region: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentState === 'Register') {
        // --- REGISTER FLOW ---
        const { data } = await axios.post(`${backendurl}/api/seller/register`, {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            nickName: formData.nickName,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            region: formData.region
        });

        if (data.success) {
          alert('Registration Successful. Please check email for OTP.');
          setCurrentState('OTP'); // Move to OTP screen
        } else {
          alert(data.message);
        }

      } else if (currentState === 'OTP') {
        // --- OTP VERIFICATION FLOW ---
        const { data } = await axios.post(`${backendurl}/api/seller/verify-otp`, {
          email: formData.email,
          otp: formData.otp
        });

        if (data.success) {
          alert('Email Verified! Logging you in...');
          localStorage.setItem('stoken', data.token); // Store Seller Token
          setatoken(data.token);
          navigate('/seller-dashboard');
        } else {
          alert(data.message);
        }

      } else {
        // --- LOGIN FLOW ---
        const { data } = await axios.post(`${backendurl}/api/seller/login`, {
          email: formData.email,
          password: formData.password
        });

        if (data.success) {
            localStorage.setItem('stoken', data.token);
            setatoken(data.token);
            // Check if backend sent a specific prompt (inactive user)
            if(data.message !== "Login successful") {
                alert(data.message); 
            }
            navigate('/seller-dashboard');
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Server Error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-10">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {currentState === 'Login' && 'Seller Login'}
          {currentState === 'Register' && 'Join as Seller'}
          {currentState === 'OTP' && 'Verify OTP'}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {currentState === 'Login' ? 'Manage your store & orders' : 
           currentState === 'Register' ? 'Fill in your business details' : 
           'Enter the code sent to your email'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- REGISTER FIELDS --- */}
          {currentState === 'Register' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input name="name" onChange={handleChange} value={formData.name} type="text" placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg" required />
                <input name="nickName" onChange={handleChange} value={formData.nickName} type="text" placeholder="Shop/Nick Name" className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <input name="phone" onChange={handleChange} value={formData.phone} type="text" placeholder="Phone Number" className="w-full px-3 py-2 border rounded-lg" required />
              
              {/* Address Section */}
              <p className="text-xs font-bold text-gray-400 uppercase">Address Details</p>
              <input name="street" onChange={handleChange} value={formData.street} type="text" placeholder="Street Address" className="w-full px-3 py-2 border rounded-lg" required />
              <div className="grid grid-cols-2 gap-2">
                <input name="city" onChange={handleChange} value={formData.city} type="text" placeholder="City" className="w-full px-3 py-2 border rounded-lg" required />
                <input name="state" onChange={handleChange} value={formData.state} type="text" placeholder="State" className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input name="pincode" onChange={handleChange} value={formData.pincode} type="number" placeholder="Pincode" className="w-full px-3 py-2 border rounded-lg" required />
                <input name="region" onChange={handleChange} value={formData.region} type="text" placeholder="Region (e.g. North)" className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
          )}

          {/* --- COMMON FIELDS (Email/Pass) --- */}
          {currentState !== 'OTP' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" onChange={handleChange} value={formData.email} type="email" placeholder="seller@example.com" className="w-full mt-1 px-3 py-2 border rounded-lg" required />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input name="password" onChange={handleChange} value={formData.password} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full mt-1 px-3 py-2 border rounded-lg" required />
                <button type="button" className="absolute top-9 right-3 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </>
          )}

          {/* --- OTP FIELD --- */}
          {currentState === 'OTP' && (
            <div>
               <label className="block text-sm font-medium text-gray-700">One Time Password (OTP)</label>
               <input name="otp" onChange={handleChange} value={formData.otp} type="text" placeholder="Enter 6-digit OTP" className="w-full mt-1 px-3 py-2 border rounded-lg text-center tracking-widest text-xl" required />
            </div>
          )}

          {/* --- SUBMIT BUTTON --- */}
          <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition duration-300">
            {currentState === 'Login' ? 'Sign In' : currentState === 'Register' ? 'Register & Verify' : 'Verify Email'}
          </button>
        </form>

        {/* --- TOGGLE LINKS --- */}
        <p className="mt-4 text-center text-gray-600 text-sm">
          {currentState === 'Login' ? (
            <>
              Don't have a seller account?{' '}
              <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setCurrentState('Register')}>Register here</span>
            </>
          ) : currentState === 'Register' ? (
            <>
              Already have an account?{' '}
              <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setCurrentState('Login')}>Login here</span>
            </>
          ) : (
            <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => setCurrentState('Register')}>Back to Register</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;