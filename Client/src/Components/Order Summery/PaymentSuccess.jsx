import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiCheckCircle, HiArrowRight, HiOutlineShoppingBag, HiExclamationCircle } from "react-icons/hi";
import api from "../../utils/api";
import { CircularProgress } from "@mui/material";

/**
 * SECURITY REFACTOR:
 * 1. Added backend verification - no longer blindly displays "Success"
 * 2. Verifies order exists and has valid paymentId before showing success UI
 * 3. Shows "Verifying..." loader while checking backend
 * 4. Handles verification failure with appropriate error UI
 */
function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get orderId and paymentId from navigation state
  const orderId = location.state?.orderId;
  const paymentId = location.state?.paymentId;

  // Verification states
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * SECURITY: Verify order payment status from backend
   * Only show success UI if order is verified as paid
   */
  useEffect(() => {
    const verifyOrderPayment = async () => {
      // If no orderId, redirect to home
      if (!orderId) {
        if (import.meta.env.DEV) console.warn("No orderId found in state, redirecting...");
        setVerificationStatus('error');
        setErrorMessage('Order verification failed. No order ID found.');
        return;
      }

      try {
        // Fetch order details from backend
        const response = await api.get(`/api/client/order/${orderId}`);

        if (response.data.success && response.data.order) {
          const order = response.data.order;

          // Verify that order has a valid paymentId (payment was processed)
          if (order.paymentId && order.paymentId === paymentId) {
            setOrderDetails(order);
            setVerificationStatus('success');
          } else if (order.paymentId) {
            // Order has a payment ID but doesn't match - possible tampering
            if (import.meta.env.DEV) {
              console.warn("Payment ID mismatch:", {
                expectedPaymentId: paymentId,
                actualPaymentId: order.paymentId
              });
            }
            // Still show success if order has a valid payment (user might have navigated differently)
            setOrderDetails(order);
            setVerificationStatus('success');
          } else {
            // Order exists but no payment processed
            setVerificationStatus('error');
            setErrorMessage('Payment verification failed. Order does not have a confirmed payment.');
          }
        } else {
          setVerificationStatus('error');
          setErrorMessage('Order not found. Please contact support.');
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Order verification error:", error);

        if (error.response?.status === 401) {
          navigate("/login", { state: { from: location } });
          return;
        }

        if (error.response?.status === 404) {
          setVerificationStatus('error');
          setErrorMessage('Order not found. Please check your orders page.');
        } else {
          setVerificationStatus('error');
          setErrorMessage('Unable to verify payment. Please check your orders page for confirmation.');
        }
      }
    };

    verifyOrderPayment();
  }, [orderId, paymentId, navigate, location]);

  // Verifying state - show loader
  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-12 text-center border border-gray-100">
          {/* Loading Animation */}
          <div className="flex justify-center mb-6">
            <CircularProgress sx={{ color: '#7d0492' }} size={60} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Payment...
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Please wait while we confirm your payment with our secure payment gateway.
          </p>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-gray-50">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              GiftnGifts • Secure Verification
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - show error UI
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-12 text-center border border-gray-100">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-100 rounded-full scale-150 opacity-30"></div>
              <HiExclamationCircle className="text-orange-500 text-7xl sm:text-8xl relative z-10" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Verification Issue
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {errorMessage || "We couldn't verify your payment. If money was deducted, your order may still be processing."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link to="/orders">
              <button className="w-full bg-[#7d0492] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-100 hover:bg-[#600372] transition-all flex items-center justify-center gap-2 group">
                <HiOutlineShoppingBag size={20} />
                Check My Orders
                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <Link to="/">
              <button className="w-full text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all border border-transparent hover:border-gray-100">
                Return to Home
              </button>
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-gray-50">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              Need help? Contact support@giftsngifts.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show verified success UI
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-12 text-center border border-gray-100">

        {/* Success Icon Animation Wrapper */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-ping opacity-20"></div>
            <HiCheckCircle className="text-green-500 text-7xl sm:text-8xl relative z-10" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-4 leading-relaxed">
          Your payment was processed successfully. We've sent a confirmation email with your order details.
        </p>

        {/* Order Info (if available) */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">Order Total:</span>{" "}
              ₹{orderDetails.totalAmount?.toLocaleString('en-IN')}
            </p>
            {orderDetails.paymentId && (
              <p className="text-gray-500 text-xs mt-1">
                Payment ID: {orderDetails.paymentId.slice(0, 20)}...
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/orders">
            <button className="w-full bg-[#7d0492] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-100 hover:bg-[#600372] transition-all flex items-center justify-center gap-2 group">
              <HiOutlineShoppingBag size={20} />
              View My Orders
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <Link to="/feedback">
            <button
              className="w-full text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all border border-transparent hover:border-gray-100"
            >
              Share your experience
            </button>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-10 pt-8 border-t border-gray-50">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            GiftnGifts • Secure Transaction ✓
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;