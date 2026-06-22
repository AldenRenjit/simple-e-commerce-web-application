import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { CartItemType } from '../types.ts';
import toast from 'react-hot-toast';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = async () => {
    try {
      const nextQty = item.quantity + 1;
      await updateQuantity(item.id, nextQty);
    } catch (err: any) {
      toast.error(err.message || 'Cannot add more items.');
    }
  };

  const handleDecrement = async () => {
    if (item.quantity <= 1) return;
    try {
      const nextQty = item.quantity - 1;
      await updateQuantity(item.id, nextQty);
    } catch (err: any) {
      toast.error(err.message || 'Error reducing quantity.');
    }
  };

  const handleDelete = async () => {
    try {
      await removeItem(item.id);
      toast.success('Removed item from shopping cart.');
    } catch (err) {
      toast.error('Could not remove item.');
    }
  };

  const parsedPrice = parseFloat(item.product?.price as string || '0');
  const rowTotal = parsedPrice * item.quantity;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-205">
      <div className="flex items-center space-x-4">
        {/* Thumbnail Image */}
        <img
          src={item.product?.image_url}
          alt={item.product?.name}
          className="w-16 h-16 object-cover rounded-lg bg-slate-50 flex-shrink-0"
          referrerPolicy="no-referrer"
        />
        
        {/* Metadata section */}
        <div>
          <h4 className="font-semibold text-slate-800 text-sm md:text-base line-clamp-1">{item.product?.name}</h4>
          <p className="text-slate-500 text-xs mt-0.5">${parsedPrice.toFixed(2)} each</p>
          <p className="text-slate-400 text-[10px] mt-0.5">Stock available: {item.product?.stock_qty}</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Quantity selectors */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5">
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30 rounded-md hover:bg-white transition-colors duration-200"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <span className="px-2.5 text-sm font-bold text-gray-850 select-none min-w-[20px] text-center">
            {item.quantity}
          </span>
          
          <button
            onClick={handleIncrement}
            disabled={item.quantity >= item.product?.stock_qty}
            className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30 rounded-md hover:bg-white transition-colors duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Row totals */}
        <div className="text-right min-w-[80px]">
          <span className="block font-bold text-gray-900 text-sm md:text-base">${rowTotal.toFixed(2)}</span>
          <button
            onClick={handleDelete}
            className="mt-1 text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50/65 transition-colors duration-200 inline-flex items-center text-xs"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
