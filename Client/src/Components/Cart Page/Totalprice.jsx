import { Divider, Button } from "@mui/material";
import { useContext } from 'react';
import { AppContext } from '../context/Appcontext.jsx';

function Totalprice({ handlePlaceOrder, selectedItemIds }) {
  const { cartItems: contextCartItems } = useContext(AppContext);
  const allCartItems = contextCartItems || [];

  const cartItems = selectedItemIds
    ? allCartItems.filter(item => selectedItemIds.includes(item.product._id))
    : allCartItems;

  const totalOriginalPrice = cartItems.reduce((acc, item) => acc + item.product.oldprice * item.quantity, 0);
  const totalDiscountedPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = totalOriginalPrice - totalDiscountedPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-wider">Order Summary</h3>

        <div className="space-y-4">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Price ({cartItems.length} items)</span>
            <span>₹{totalOriginalPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-green-600 text-sm">
            <span>Discount</span>
            <span>- ₹{discountAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-500 text-sm">
            <span>Delivery Charges</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>

          <Divider className="!my-4" />

          <div className="flex justify-between items-end">
            <span className="text-gray-800 font-bold">Total Amount</span>
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900 leading-none">₹{totalDiscountedPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#fb541b]/5 pb-2 pt-4 text-center">
        <p className="text-sm font-medium text-[#fb541b]">
          🎊 You saved ₹{discountAmount.toFixed(2)}!
        </p>
      </div>

    </div>
  );
}

export default Totalprice;