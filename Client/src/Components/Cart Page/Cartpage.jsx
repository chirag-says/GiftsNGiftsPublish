import { useContext, useEffect } from "react";
import { AppContext } from "../context/Appcontext.jsx";
import CartItems from "./CartItems";
import Totalprice from "./Totalprice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Divider } from "@mui/material";
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

function Cartpage() {
  const navigate = useNavigate();
  const { cartItems, setCartItems, fetchCart } = useContext(AppContext);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartItemId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/auth/delete/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((item) => item.product._id !== cartItemId));
    } catch (err) {
      console.error("Error removing cart item:", err);
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-quantity`,
        { productId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) => item.product._id === productId ? { ...item, quantity: newQty } : item)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Error updating quantity");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#fb541b] p-2 rounded-lg">
            <ShoppingBagOutlinedIcon className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your Shopping Bag</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Part: List of Items */}
          <div className="w-full lg:w-[68%]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <span className="text-sm text-gray-500">
                  You have <span className="font-bold text-gray-900">{cartItems.length} items</span> in your cart
                </span>
              </div>

              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
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
                  <div className="py-20 text-center flex flex-col items-center">
                    <p className="text-gray-400 mb-6">Your cart feels a bit light...</p>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/')}
                      className="!border-[#fb541b] !text-[#fb541b]"
                    >
                      Start Shopping
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/')}
              className="mt-6 text-sm font-medium text-gray-500 hover:text-[#fb541b] transition-colors"
            >
              ← Continue Shopping
            </button>
          </div>

          {/* Right Part: Checkout Summary (Sticky) */}
          <div className="w-full lg:w-[32%] lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <Totalprice handlePlaceOrder={() => navigate("/addaddress")} />
              <Button
                fullWidth
                onClick={() => navigate("/addaddress")}
                variant="contained"
                className="!mt-6 !bg-[#fb541b] !py-3 !rounded-xl !font-bold !text-lg !shadow-orange-200 !shadow-lg hover:!bg-[#e44a15]"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cartpage;