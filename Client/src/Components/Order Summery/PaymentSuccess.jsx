import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiCheckCircle, HiArrowRight, HiOutlineShoppingBag, HiExclamationCircle, HiSparkles } from "react-icons/hi";
import api from "../../utils/api";
import { CircularProgress } from "@mui/material";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  const paymentId = location.state?.paymentId;

  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const verifyOrderPayment = async () => {
      if (!orderId) { setVerificationStatus('error'); return; }
      try {
        const response = await api.get(`/api/client/order/${orderId}`);
        if (response.data.success && response.data.order) {
          setOrderDetails(response.data.order);
          setVerificationStatus('success');
        } else { setVerificationStatus('error'); }
      } catch (err) { setVerificationStatus('error'); }
    };
    verifyOrderPayment();
  }, [orderId]);

  if (verificationStatus === 'verifying') return (
    <div className="flex items-center justify-center bg-[#F9F6F0]">
      <div className="text-center bg-white p-16 rounded-[3rem] shadow-xl border border-[#EDE3D2]">
        <CircularProgress sx={{ color: '#B58D2F' }} size={60} />
        <h1 className="font-serif text-2xl font-bold text-[#322619] mt-8">Verifying Artisan Order...</h1>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center bg-[#fcfcf9] p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl border border-[#EDE3D2] p-10 text-center relative overflow-hidden">
        {verificationStatus === 'success' ? (
          <>
            <div className="flex justify-center mb-8"><HiCheckCircle className="text-[#B58D2F] text-8xl" /></div>
            <h1 className="font-serif text-3xl font-bold text-[#322619] mb-4">Your Order Confirmed</h1>
            <p className="text-[#544231] opacity-70 mb-8 font-medium">Your masterpiece has been reserved. A confirmation email is on its way to your gallery.</p>
            {orderDetails && (
              <div className="bg-[#FDFBF7] rounded-[2rem] border-2 border-dashed border-[#EDE3D2] p-6 mb-8 text-sm">
                <p className="text-[#322619] font-bold">Order Total: ₹{orderDetails.totalAmount?.toLocaleString()}</p>
                <p className="text-[#544231]/60 text-[10px] mt-2 uppercase tracking-widest">ID: {paymentId?.slice(0, 15)}...</p>
              </div>
            )}
            <div className="space-y-4">
              <Link to="/orders" className="block w-full bg-[#322619] text-white py-4 rounded-full font-bold shadow-xl hover:bg-[#B58D2F] transition-all">View Order History</Link>
              <Link to="/" className="block text-xs font-black uppercase tracking-[0.2em] text-[#544231] hover:text-[#B58D2F] transition-colors">Return to Boutique</Link>
            </div>
          </>
        ) : (
          <>
            <HiExclamationCircle className="text-orange-500 text-8xl mx-auto mb-8" />
            <h1 className="font-serif text-3xl font-bold text-[#322619] mb-4">Verification Delayed</h1>
            <p className="text-[#544231] opacity-70 mb-10">We couldn't verify your order instantly. Please check your "My Orders" gallery in a few moments.</p>
            <Link to="/orders" className="block w-full bg-[#322619] text-white py-4 rounded-full font-bold shadow-xl">Go to Orders</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;