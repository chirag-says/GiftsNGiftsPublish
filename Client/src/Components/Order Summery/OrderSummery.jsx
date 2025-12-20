import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/Appcontext.jsx";
import CartItems from "../Cart Page/CartItems.jsx";
import Totalprice from "../Cart Page/Totalprice.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Divider, Paper } from "@mui/material";
import { HiOutlineLocationMarker, HiOutlineShieldCheck, HiOutlineShoppingBag } from "react-icons/hi";

function OrderSummery() {
  const navigate = useNavigate();
  const { cartItems, setCartItems, fetchCart, clearCartAfterOrder } = useContext(AppContext);
  const token = localStorage.getItem("token");
  const [address, setAddress] = useState(null);

  useEffect(() => {
    fetchCart();
    const savedAddress = JSON.parse(localStorage.getItem("selectedAddress"));
    setAddress(savedAddress);
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/delete/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((item) => item.product._id !== cartItemId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-quantity`,
        { productId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product._id === productId ? { ...item, quantity: newQty } : item
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Error updating quantity");
    }
  };

  const buildOrderPayload = () => {
    if (!address) {
      alert("Please select a shipping address.");
      throw new Error("Address missing");
    }

    const items = cartItems.map((item) => ({
      productId: item.product._id,
      name: item.product.title || item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      sellerId: item.product.sellerId
    }));

    return {
      items,
      totalAmount: items.reduce((total, item) => total + item.price * item.quantity, 0),
      shippingAddress: {
        name: address.fullName,
        pin: address.pin,
        city: address.city,
        state: address.state,
        phone: address.phoneNumber,
        address: address.address,
      },
      image: cartItems[0]?.product.image || "",
    };
  };

  const checkoutHandler = async () => {
    const totalAmount = cartItems.reduce((t, i) => t + i.product.price * i.quantity, 0);

    try {
      const { data: { key } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getkey`);
      const { data: { order } } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/checkout`, {
        amount: totalAmount,
      });

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "GiftnGifts",
        description: "Secure Order Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const orderData = { ...buildOrderPayload(), paymentId: response.razorpay_payment_id };
            const res = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/client/place-order`,
              orderData,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
              await clearCartAfterOrder();
              navigate("/payment-success");
            }
          } catch (error) {
            alert("Order failed to save. Please contact support.");
          }
        },
        prefill: { name: address?.fullName, contact: address?.phoneNumber },
        theme: { color: "#7d0492" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      alert("Payment initialization failed.");
    }
  };

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
              {address ? (
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
                  <HiOutlineShoppingBag className="text-[#7d0492]" /> Items in your Order ({cartItems.length})
                </h3>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto bg-white">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
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
                  disabled={cartItems.length === 0 || !address}
                  className="!bg-[#ff9f00] !py-4 !rounded-xl !font-bold !text-lg !shadow-lg"
                >
                  Confirm and Pay
                </Button>
            </div>
          </div>

          {/* Sidebar (Price Summary) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-28 space-y-4">
              <Totalprice />
              
              <div className="hidden lg:block">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={checkoutHandler}
                  disabled={cartItems.length === 0 || !address}
                  className="!bg-[#ff9f00] !py-4 !rounded-xl !font-bold !text-lg !shadow-xl hover:!bg-[#e68a00] transition-all transform hover:scale-[1.02]"
                >
                  Complete Payment
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