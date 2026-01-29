import PropTypes from "prop-types";
import { Checkbox } from "@mui/material";
import { Link } from "react-router-dom";
import { IoTrashOutline } from "react-icons/io5";
import { HiOutlineBadgeCheck } from "react-icons/hi";

function CartItems({ product, cartItemId, onRemove, onUpdateQuantity, quantity, isSelected, onSelect }) {
  return (
    <div className="group relative flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-[2rem] border border-[#EDE3D2] transition-all duration-500 ">

      {/* Selection Checkbox */}
      {onSelect && (
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(cartItemId)}
          sx={{ '&.Mui-checked': { color: '#B58D2F' }, '& .MuiSvgIcon-root': { fontSize: 28 } }}
        />
      )}

      {/* Image Section */}
      <div className="relative w-full sm:w-32 h-32 bg-[#F9F6F0] rounded-2xl flex items-center justify-center p-4 flex-shrink-0 overflow-hidden border border-[#EDE3D2]/50">
        <Link to={`/products/${product._id}`} className="w-full h-full">
          <img
            src={product?.image || "https://placehold.co/150"}
            alt={product?.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
          />
        </Link>
        {product.oldprice > product.price && (
          <div className="absolute top-0 left-0 bg-[#A34343] text-white text-[9px] font-black uppercase tracking-tighter px-3 py-1 rounded-br-xl shadow-sm">
            {Math.round(((product.oldprice - product.price) / product.oldprice) * 100)}% Off
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="space-y-1">
            <Link to={`/products/${product._id}`}>
              <h3 className="font-serif text-[#322619] font-bold text-lg hover:text-[#B58D2F] transition-colors line-clamp-1">
                {product.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2">
              <HiOutlineBadgeCheck className="text-[#B58D2F] text-lg" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#544231]/60">
                {product.brand || "Artisan Craft"}
              </span>
            </div>
          </div>

          <button
            onClick={() => onRemove(cartItemId)}
            className="p-3 text-[#544231]/40 hover:text-[#A34343] hover:bg-red-50 rounded-full transition-all"
          >
            <IoTrashOutline size={22} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Pill Quantity Selector */}
          <div className="flex items-center bg-[#F9F6F0] border border-[#EDE3D2] p-1 rounded-full">
            <button
              onClick={() => quantity > 1 && onUpdateQuantity(cartItemId, quantity - 1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#322619] shadow-sm hover:bg-[#B58D2F] hover:text-white transition-all disabled:opacity-20"
              disabled={quantity <= 1}
            > – </button>
            <span className="w-10 text-center text-sm font-bold text-[#322619]">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(cartItemId, quantity + 1)}
              disabled={quantity >= product.stock}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#322619] shadow-sm hover:bg-[#B58D2F] hover:text-white transition-all disabled:opacity-20"
            > + </button>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-[#544231]/30 text-xs line-through">₹{(product.oldprice * quantity).toFixed(0)}</span>
              <span className="text-[#322619] font-black text-2xl tracking-tighter">₹{(product.price * quantity).toFixed(0)}</span>
            </div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
              Saving ₹{((product.oldprice - product.price) * quantity).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItems;