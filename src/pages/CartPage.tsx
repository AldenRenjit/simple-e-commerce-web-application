import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import CartItem from '../components/CartItem.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { ShoppingBag, ArrowRight, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';

const CartPage: React.FC = () => {
  const { items, totals, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    // If user is not logged in, they navigate to login first with state to return
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Re-calculating basket summaries..." fullPage={true} />;
  }

  const isCartEmpty = items.length === 0;

  return (
    <div className="bento-grid-container min-h-screen pb-16 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-sans mb-8">
          Your Shopping Basket
        </h1>

        {isCartEmpty ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-550 mx-auto mb-5">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1.5">Your Basket is Empty</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-6">
              Looks like you haven't added anything to your cart yet. Explore our latest electronics, apparel collections, and technical books.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Catalog Showcase</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Column 1-2: Shopping List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
              
              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-850"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Catalog and continue shopping</span>
                </Link>
              </div>
            </div>

            {/* Column 3: Cart Summary checkout card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs">Basket Summary</h3>
              
              <div className="space-y-3.5 text-sm font-semibold">
                
                {/* Subtotal */}
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-sans">${totals.subtotal.toFixed(2)}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>VAT (10%)</span>
                  <span className="font-sans">${totals.tax.toFixed(2)}</span>
                </div>

                <hr className="border-slate-100" />

                {/* Total */}
                <div className="flex justify-between text-gray-950 text-base font-extrabold pb-2">
                  <span>Grand Total</span>
                  <span className="font-sans text-xl text-indigo-600 font-extrabold">${totals.total.toFixed(2)}</span>
                </div>

              </div>

              {/* Guest / User Info warning */}
              {!user && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-amber-805 leading-relaxed">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>
                    You are checking out as a <strong>Guest</strong>. We'll prompt you to log in or create a standard user profile to submit and track your order.
                  </span>
                </div>
              )}

              {/* Proceed Button */}
              <button
                onClick={handleCheckoutRedirect}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 font-bold uppercase select-none">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sequelize + Stripe Sandbox Checkout</span>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
