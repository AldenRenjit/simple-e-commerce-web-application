import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { Product } from '../types.ts';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page if adding from grid
    try {
      await addToCart(product.id, 1);
      toast.success(`"${product.name}" added to cart!`, {
        icon: '🛒',
        position: 'bottom-right'
      });
    } catch (err: any) {
      toast.error(err.message || 'Could not add item to cart.');
    }
  };

  const isLowStock = product.stock_qty > 0 && product.stock_qty < 5;
  const isOutOfStock = product.stock_qty <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-305 overflow-hidden flex flex-col h-full">
      {/* Product Image Panel */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-gray-50 pt-[100%]">
        <img
          src={product.image_url}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.category && (
            <span className="bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {product.category.name}
            </span>
          )}
          {isOutOfStock ? (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
              Only {product.stock_qty} Left
            </span>
          ) : (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              In Stock
            </span>
          )}
        </div>
      </Link>

      {/* Info Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="block mb-1.5">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base group-hover:text-indigo-600 line-clamp-1 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-xs line-clamp-2 mb-3.5 flex-1 h-8">
          {product.description || 'No description available.'}
        </p>

        {/* Rating and Price Row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold font-sans text-gray-900">
              ${parseFloat(product.price as string).toFixed(2)}
            </span>
            {/* Rating Stars */}
            <div className="flex items-center space-x-1 mt-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs text-gray-600 font-medium">
                {parseFloat(product.rating as string || '4.5').toFixed(1)}
              </span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-100 hover:shadow-indigo-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
