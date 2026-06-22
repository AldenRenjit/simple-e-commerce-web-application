import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.ts';
import { useCart } from '../context/CartContext.tsx';
import { Product } from '../types.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Heart, Share2, AlertTriangle, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err: any) {
        setErrorMessage(err.message || 'Product details are unavailable.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleIncrement = () => {
    if (product && quantity < product.stock_qty) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      toast.success(`Success! Added ${quantity} item${quantity > 1 ? 's' : ''} to card.`, {
        icon: '🛒',
        position: 'bottom-right'
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Inspecting item specifications..." fullPage={true} />;
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Item Specifications Missing</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {errorMessage || 'We could not fetch details for this model, or the product has been deactivated by an Admin.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-755 text-white font-bold text-sm px-6 py-2.5 rounded-lg active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront Catalog</span>
        </button>
      </div>
    );
  }

  const isLowStock = product.stock_qty > 0 && product.stock_qty < 5;
  const isOutOfStock = product.stock_qty <= 0;

  return (
    <div className="bento-grid-container min-h-screen pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors duration-150 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Product Catalog</span>
        </Link>

        {/* Detail Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Image Showcase */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-center items-center relative aspect-square overflow-hidden group">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl shadow-xs group-hover:scale-102 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            
            {/* Stock status indicator badges */}
            <div className="absolute top-10 left-10 z-10">
              {isOutOfStock ? (
                <span className="bg-rose-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                  SOLDOUT
                </span>
              ) : isLowStock ? (
                <span className="bg-amber-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md animate-pulse">
                  Only {product.stock_qty} Items Left
                </span>
              ) : (
                <span className="bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                  Fully In Stock
                </span>
              )}
            </div>
          </div>

          {/* Column 2: Specs Body */}
          <div className="space-y-6">
            
            {/* Category tag and ID */}
            <div className="flex items-center justify-between">
              {product.category ? (
                <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-750 font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full">
                  {product.category.name} Collection
                </span>
              ) : (
                <span className="text-xs text-gray-400 font-bold uppercase">Basic Inventory</span>
              )}
              <span className="text-xs font-mono text-gray-400 font-medium">Model ID: #{product.id}</span>
            </div>

            {/* Title & Ratings */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-gray-900 font-sans leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const ratingNum = parseFloat(product.rating as string || '4.5');
                    const isActive = i < Math.floor(ratingNum);
                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          isActive ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
                        }`}
                      />
                    );
                  })}
                  <span className="text-xs font-bold text-gray-700 ml-1.5">
                    {parseFloat(product.rating as string || '4.5').toFixed(1)} score
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Fast Shipping</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Price display */}
            <div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Direct Purchase Price</span>
              <div className="text-3xl md:text-4xl font-extrabold text-gray-950 font-sans mt-1">
                ${parseFloat(product.price as string).toFixed(2)}
                <span className="text-xs font-bold text-gray-400 ml-1.5 uppercase font-sans tracking-wide">USD + VAT</span>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-1.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Product Overview & Features</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {product.description || 'This item exemplifies our dedication to standard components. Carefully curated, tested with local schemas, and guaranteed to fit your requirements. Reach out to support for spec variations.'}
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* Interaction Row: Quantity & Cart Triggers */}
            <div className="space-y-4">
              
              {!isOutOfStock ? (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  
                  {/* Quantity counters */}
                  <div className="flex flex-col items-start w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 select-none">Quantity</span>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1 w-full sm:w-auto justify-between sm:justify-start">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 disabled:opacity-30 rounded-lg hover:bg-white transition-colors duration-200"
                        title="Reduce quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="px-5 text-base font-bold text-gray-800 select-none min-w-[40px] text-center">
                        {quantity}
                      </span>
                      
                      <button
                        onClick={handleIncrement}
                        disabled={quantity >= product.stock_qty || isOutOfStock}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 disabled:opacity-30 rounded-lg hover:bg-white transition-colors duration-200"
                        title="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add action trigger */}
                  <div className="w-full flex-1 pt-5">
                    <button
                      onClick={handleAddToCart}
                      disabled={adding || isOutOfStock}
                      className="w-full flex items-center justify-center space-x-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{adding ? 'Synchronizing checkout...' : 'Add Product to Cart'}</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>Out of stock. We have notified our warehouse managers to replenish as soon as possible.</span>
                </div>
              )}

            </div>

            <hr className="border-gray-100" />

            {/* Quality badge certifications */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Sequelize Type-Safe Verified</span>
              </div>
              <div className="flex items-center space-x-2 font-mono">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                <span>Stripe Test Enabled</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
