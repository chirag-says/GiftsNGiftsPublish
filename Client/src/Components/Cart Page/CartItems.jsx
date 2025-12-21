import PropTypes from "prop-types";
import { Checkbox } from "@mui/material";
import { Link } from "react-router-dom";
import { IoTrashOutline } from "react-icons/io5";
import { HiOutlineBadgeCheck } from "react-icons/hi";

function CartItems({ product, cartItemId, onRemove, onUpdateQuantity, quantity, isSelected, onSelect }) {
  return (
    <div className="group relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6 py-5 px-4 mb-4 bg-white rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:border-orange-100">

      {/* Selection Checkbox */}
      {onSelect && (
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(cartItemId)}
          sx={{ '&.Mui-checked': { color: '#fb541b' } }}
        />
      )}

      {/* 1. Image Section - Centered on mobile, left-aligned on desktop */}
      <div className="relative w-full sm:w-35 h-40 sm:h-35 bg-gray-50 rounded-xl flex items-center justify-center p-3 flex-shrink-0 overflow-hidden">
        <Link to={`/products/${product._id}`} className="w-full h-full">
          <img
            src={product?.image || "https://placehold.co/150"}
            alt={product?.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 rounded-xl"
          />
        </Link>
        {/* Subtle Discount Tag on Image */}
        {product.oldprice > product.price && (
          <div className="absolute top-2 left-2 bg-[#fb541b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{Math.round(((product.oldprice - product.price) / product.oldprice) * 100)}%
          </div>
        )}
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 w-full flex flex-col justify-between py-1">

        {/* Top Info Row */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="space-y-1">
            <Link to={`/products/${product._id}`}>
              <h3 className="text-gray-900 font-extrabold text-sm sm:text-base hover:text-[#fb541b] transition-colors line-clamp-1 leading-snug">
                {product.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-gray-400">
              <HiOutlineBadgeCheck className="text-blue-500" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                {product.brand || "Authentic Item"}
              </span>
            </div>
          </div>

          <button
            onClick={() => onRemove(cartItemId)}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm sm:shadow-none"
            title="Remove from bag"
          >
            <IoTrashOutline size={20} />
          </button>
        </div>

        {/* Bottom Interaction Row */}
        <div className="flex items-center justify-between mt-auto">

          {/* Stylized Quantity Selector */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-xl gap-1">
            <button
              onClick={() => quantity > 1 && onUpdateQuantity(cartItemId, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-[#fb541b] active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
              disabled={quantity <= 1}
            > – </button>

            <span className="w-8 text-center text-xs font-black text-gray-800">
              {quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(cartItemId, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:text-[#fb541b] active:scale-90 transition-all"
            > + </button>
          </div>

          {/* Pricing Section */}
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-gray-400 text-xs line-through decoration-gray-300">
                ₹{(product.oldprice * quantity).toFixed(0)}
              </span>
              <span className="text-gray-900 font-black text-xl tracking-tight">
                ₹{(product.price * quantity).toFixed(0)}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-green-600">
                Saving ₹{((product.oldprice - product.price) * quantity).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CartItems.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    image: PropTypes.string,
    brand: PropTypes.string,
    price: PropTypes.number,
    oldprice: PropTypes.number,
  }).isRequired,
  cartItemId: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  quantity: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default CartItems;