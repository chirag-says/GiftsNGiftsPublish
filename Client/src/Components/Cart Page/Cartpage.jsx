import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/Appcontext.jsx";
import CartItems from "./CartItems";
import Totalprice from "./Totalprice";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { toast } from 'react-toastify';
import { HiArrowLeft } from "react-icons/hi";

function Cartpage() {
  const navigate = useNavigate();
  const { cartItems, setCartItems, fetchCart } = useContext(AppContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      if (!initialized) {
        setSelectedItems(cartItems.map(item => item.product._id));
        setInitialized(true);
      } else {
        setSelectedItems(prev => prev.filter(id => cartItems.some(item => item.product._id === id)));
      }
    }
  }, [cartItems]);

  const handleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    } else {
      setSelectedItems(prev => [...prev, id]);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await api.delete(`/api/auth/delete/${cartItemId}`);
      setCartItems((prev) => prev.filter((item) => item.product._id !== cartItemId));
    } catch (err) { console.error("Error removing cart item:", err); }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    try {
      await api.put('/api/auth/update-quantity', { productId, quantity: newQty });
      setCartItems((prevItems) =>
        prevItems.map((item) => item.product._id === productId ? { ...item, quantity: newQty } : item)
      );
    } catch (err) { toast.error(err.response?.data?.message || "Error updating quantity"); }
  };

  return (
    <section className="min-h-screen bg-[#fcfcf9] py-12 px-4 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Title with Signature Golden Line */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-[#B58D2F] p-3 rounded-2xl shadow-lg shadow-[#B58D2F]/20">
              <ShoppingBagOutlinedIcon className="text-white" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#322619]">Your Shopping Bag</h1>
          </div>
          <div className="w-24 h-1 bg-[#B58D2F]"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Left Part: List of Items */}
          <div className="w-full lg:w-[65%]">
            <div className="p-2">
               <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#544231]/60 mb-6">
                You have <span className="text-[#B58D2F]">{cartItems.length} items</span> in your cart
              </p>
              
              <div className="space-y-4 max-h-[700px] overflow-y-auto no-scrollbar pr-2">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <CartItems
                      key={item.product._id}
                      cartItemId={item.product._id}
                      product={item.product}
                      quantity={item.quantity}
                      onRemove={handleRemove}
                      onUpdateQuantity={handleUpdateQuantity}
                      isSelected={selectedItems.includes(item.product._id)}
                      onSelect={handleSelect}
                    />
                  ))
                ) : (
                  <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-[#EDE3D2]">
                    <p className="font-serif text-xl text-[#544231] mb-8">Your bag is currently empty of treasures.</p>
                    <button
                      onClick={() => navigate('/')}
                      className="bg-[#322619] text-[#F9F6F0] px-10 py-4 rounded-full font-bold hover:bg-[#B58D2F] transition-all shadow"
                    >
                      Explore Collections
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#544231] hover:text-[#B58D2F] transition-colors"
            >
              <HiArrowLeft className="text-lg" /> Back to Collections
            </button>
          </div>

          {/* Right Part: Checkout Summary */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-28">
            <div className="bg-white rounded-[2.5rem] shadow shadow-[#322619]/5 border border-[#EDE3D2] p-8">
              <Totalprice
                handlePlaceOrder={() => navigate("/addaddress", { state: { selectedItems } })}
                selectedItemIds={selectedItems}
              />
              <Button
                fullWidth
                onClick={() => {
                  if (selectedItems.length === 0) {
                    toast.warning("Select a piece to continue.");
                    return;
                  }
                  navigate("/addaddress", { state: { selectedItems } });
                }}
                disabled={selectedItems.length === 0}
                className="!mt-8 !bg-[#322619] !text-[#F9F6F0] !py-5 !rounded-full !font-bold !text-sm !tracking-[0.2em] !shadow-2xl hover:!bg-[#B58D2F] !transition-all"
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