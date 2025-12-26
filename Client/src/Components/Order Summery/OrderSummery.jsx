import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/Appcontext.jsx";
import CartItems from "../Cart Page/CartItems.jsx";
import Totalprice from "../Cart Page/Totalprice.jsx";
import api from "../../utils/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Divider, Paper, CircularProgress } from "@mui/material";
import { HiOutlineLocationMarker, HiOutlineShieldCheck, HiOutlineShoppingBag } from "react-icons/hi";
import { toast } from "react-toastify";

/**
 * SECURITY REFACTOR (v2.0):
 * 
 * CRITICAL FIX #1 - Price Manipulation Prevention:
 * - REMOVED: Client-side price calculation sent to /api/checkout
 * - NOW: Send only item IDs and quantities to backend
 * - Backend fetches REAL prices from database and calculates total
 * 
 * CRITICAL FIX #2 - Volatile State Protection:
 * - REMOVED: Fallback to full cart when selectedItems is undefined
 * - NOW: Redirect to /cartlist if navigation state is missing
 * - Prevents accidental bulk purchases on page refresh
 * 
 * SECURITY FIX #3 - PII Protection:
 * - Address fetched from authenticated backend API (not localStorage)
 */
function OrderSummery() {
  const navigate = useNavigate();
  const { cartItems, setCartItems, fetchCart, clearCartAfterOrder, isLoggedin } = useContext(AppContext);
  const location = useLocation();

  // Get selected items and address ID from navigation state
  const selectedItems = location.state?.selectedItems;
  const selectedAddressId = location.state?.selectedAddressId;

  /**
   * SECURITY FIX #2: Redirect Protection for Volatile State
   * 
   * If the user refreshes the page or navigates directly to /ordersummery,
   * location.state will be undefined. Instead of defaulting to the ENTIRE cart
   * (which could cause accidental bulk purchases), we redirect back to cart.
   */
  useEffect(() => {
    if (!location.state || !location.state.selectedItems) {
      toast.warning("Your session expired. Please select items again.");
      navigate("/cartlist", { replace: true });
    }
  }, []);

  // Only proceed if we have valid selected items
  const itemsToBuy = selectedItems
    ? cartItems.filter(item => selectedItems.includes(item.product._id))
    : []; // Empty array - component will redirect before this is used

  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  /**
   * SECURITY: Fetch address from authenticated backend API
   * This replaces the insecure localStorage.getItem("selectedAddress") pattern
   */
  const fetchShippingAddress = async () => {
    setAddressLoading(true);
    setAddressError(null);

    try {
      let response;

      if (selectedAddressId) {
        // Fetch specific address by ID (passed via navigation state)
        response = await api.get(`/api/user/address/${selectedAddressId}`);
      } else {
        // Fallback: Fetch user's default shipping address
        response = await api.get('/api/user/default-shipping-address');
      }

      if (response.data.success && response.data.address) {
        setAddress(response.data.address);
      } else {
        setAddressError("No shipping address found. Please add an address.");
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error fetching address:", err);

      if (err.response?.status === 401) {
        setAddressError("Session expired. Please login again.");
        navigate("/login", { state: { from: location } });
        return;
      }

      setAddressError(err.response?.data?.message || "Failed to load shipping address.");
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoggedin) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Only fetch if we have valid state
    if (location.state?.selectedItems) {
      fetchCart();
      fetchShippingAddress();
    }
  }, [isLoggedin]);

  const handleRemove = async (cartItemId) => {
    try {
      await api.delete(`/api/auth/delete/${cartItemId}`);
      setCartItems((prev) => prev.filter((item) => item.product._id !== cartItemId));
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error removing item:", err);
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    try {
      await api.put(
        '/api/auth/update-quantity',
        { productId, quantity: newQty }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product._id === productId ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating quantity");
    }
  };

  const buildOrderPayload = () => {
    if (!address) {
      toast.error("Please select a shipping address.");
      throw new Error("Address missing");
    }

    const items = itemsToBuy.map((item) => ({
      productId: item.product._id,
      name: item.product.title || item.product.name,
      quantity: item.quantity,
      price: item.product.price, // For display only - backend will verify
      sellerId: item.product.sellerId
    }));

    return {
      items,
      // NOTE: totalAmount will be RECALCULATED by backend for order storage
      totalAmount: items.reduce((total, item) => total + item.price * item.quantity, 0),
      shippingAddress: {
        name: address.fullName,
        pin: address.pin,
        city: address.city,
        state: address.state,
        phone: address.phoneNumber,
        address: address.address,
      },
      image: itemsToBuy[0]?.product.image || "",
    };
  };

  /**
   * SECURITY FIX #1: Secure Checkout Handler
   * 
   * BEFORE (VULNERABLE):
   *   const totalAmount = itemsToBuy.reduce(...); // Client calculates
   *   api.post('/api/checkout', { amount: totalAmount }); // Hackable!
   * 
   * AFTER (SECURE):
   *   api.post('/api/checkout', { items }); // Send only IDs + quantities
   *   // Backend fetches real prices from DB and calculates total
   */
  const checkoutHandler = async () => {
    if (isProcessingPayment) return; // Prevent double-click
    setIsProcessingPayment(true);

    try {
      // Build secure payload: ONLY product IDs and quantities
      const securePayload = {
        items: itemsToBuy.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        }))
      };

      // Step 1: Get Razorpay key
      const { data: { key } } = await api.get('/api/getkey');

      // Step 2: Create order with SERVER-SIDE price calculation
      // Backend will fetch real prices from database and calculate total
      const { data } = await api.post('/api/checkout', securePayload);

      if (!data.success || !data.order) {
        throw new Error(data.error || "Failed to create payment order");
      }

      const { order, breakdown } = data;

      // Optional: Show user what the server calculated (for transparency)
      if (import.meta.env.DEV) {
        console.log("[Secure Checkout] Server-calculated total:", breakdown?.total);
      }

      // Step 3: Open Razorpay with SERVER-CALCULATED amount
      const options = {
        key,
        amount: order.amount, // This is the server-calculated amount in paise
        currency: "INR",
        name: "GiftnGifts",
        description: "Secure Order Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const orderData = {
              ...buildOrderPayload(),
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: order.id, // For backend verification
              serverCalculatedTotal: breakdown?.total // For reconciliation
            };

            const res = await api.post('/api/client/place-order', orderData);

            if (res.data.success) {
              const orderId = res.data.order?._id;

              // Clear purchased items from cart
              if (selectedItems && selectedItems.length < cartItems.length) {
                for (const item of itemsToBuy) {
                  await api.delete(`/api/auth/delete/${item.product._id}`);
                }
                fetchCart();
              } else {
                await clearCartAfterOrder();
              }

              // Navigate to success page with order ID for verification
              navigate("/payment-success", {
                state: { orderId, paymentId: response.razorpay_payment_id }
              });
            }
          } catch (error) {
            toast.error("Order failed to save. Please contact support.");
            if (import.meta.env.DEV) console.error("Order save error:", error);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.info("Payment cancelled");
          }
        },
        prefill: {
          name: address?.fullName,
          contact: address?.phoneNumber
        },
        theme: { color: "#7d0492" },
      };

      const razor = new window.Razorpay(options);
      razor.on('payment.failed', function (response) {
        setIsProcessingPayment(false);
        toast.error("Payment failed. Please try again.");
        if (import.meta.env.DEV) console.error("Payment failed:", response.error);
      });
      razor.open();

    } catch (error) {
      setIsProcessingPayment(false);
      toast.error(error.message || "Payment initialization failed.");
      if (import.meta.env.DEV) console.error("Checkout error:", error);
    }
  };

  // Loading state while fetching address
  if (addressLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CircularProgress sx={{ color: '#7d0492' }} />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#7d0492] p-2 rounded-lg text-white">
            <HiOutlineShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Review Your Order</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-[70%] space-y-6">

            {/* 1. Delivery Address Card */}
            <Paper elevation={0} className="border border-gray-200 p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="flex items-center gap-2 font-bold text-gray-700">
                  <HiOutlineLocationMarker className="text-[#7d0492]" /> Delivery Address
                </h3>
                <Button
                  size="small"
                  onClick={() => navigate("/addaddress")}
                  className="!text-[#7d0492] !font-bold"
                >
                  Change
                </Button>
              </div>

              {addressError ? (
                <div className="text-red-500 text-sm">
                  <p className="italic">{addressError}</p>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate("/addaddress")}
                    className="!mt-2"
                  >
                    Add Address
                  </Button>
                </div>
              ) : address ? (
                <div className="text-sm text-gray-600">
                  <p className="font-bold text-gray-900 mb-1">{address.fullName}</p>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} - {address.pin}</p>
                  <p className="mt-2 font-medium">Phone: {address.phoneNumber}</p>
                </div>
              ) : (
                <p className="text-red-500 text-sm italic">No address selected. Please go back.</p>
              )}
            </Paper>

            {/* 2. Items List Card */}
            <Paper elevation={0} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b bg-white">
                <h3 className="flex items-center gap-2 font-bold text-gray-700">
                  <HiOutlineShoppingBag className="text-[#7d0492]" /> Items in your Order ({itemsToBuy.length})
                </h3>
              </div>

              <div className="max-h-[500px] overflow-y-auto bg-white">
                {itemsToBuy.length > 0 ? (
                  itemsToBuy.map((item) => (
                    <CartItems
                      key={item.product._id}
                      cartItemId={item.product._id}
                      product={item.product}
                      quantity={item.quantity}
                      onRemove={handleRemove}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-400 italic">No items found in your cart.</div>
                )}
              </div>
            </Paper>

            {/* Bottom Pay Button for Mobile (Hidden on LG) */}
            <div className="lg:hidden">
              <Button
                fullWidth
                variant="contained"
                onClick={checkoutHandler}
                disabled={itemsToBuy.length === 0 || !address || !!addressError || isProcessingPayment}
                className="!bg-[#ff9f00] !py-4 !rounded-xl !font-bold !text-lg !shadow-lg"
              >
                {isProcessingPayment ? (
                  <span className="flex items-center gap-2">
                    <CircularProgress size={20} color="inherit" /> Processing...
                  </span>
                ) : (
                  "Confirm and Pay"
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar (Price Summary) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-28 space-y-4">
              <Totalprice selectedItemIds={selectedItems} />

              <div className="hidden lg:block">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={checkoutHandler}
                  disabled={itemsToBuy.length === 0 || !address || !!addressError || isProcessingPayment}
                  className="!bg-[#ff9f00] !py-4 !rounded-xl !font-bold !text-lg !shadow-xl hover:!bg-[#e68a00] transition-all transform hover:scale-[1.02]"
                >
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-2">
                      <CircularProgress size={20} color="inherit" /> Processing...
                    </span>
                  ) : (
                    "Complete Payment"
                  )}
                </Button>
              </div>

              <p className="text-center text-[11px] text-gray-400 uppercase tracking-widest font-medium">
                🔒 Secure 256-bit SSL Encrypted Payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummery;