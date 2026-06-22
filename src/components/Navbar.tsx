import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, ShieldAlert, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Total quantity of items in the cart
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch (err) {
      toast.error('Logout failed.');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center space-x-1">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
              <Store className="w-6 h-6 text-indigo-600" />
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-gray-900">
                Aero<span className="text-indigo-600">Cart</span>
              </span>
            </Link>
          </div>

          {/* Nav Right */}
          <div className="flex items-center space-x-4">
            
            {/* Storefront Link */}
            <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors duration-200 hidden sm:inline-block">
              Catalog
            </Link>

            {/* Shopping Cart button */}
            <Link
              to="/cart"
              id="nav-cart-btn"
              className="relative p-2.5 rounded-lg text-gray-650 hover:text-indigo-600 hover:bg-gray-50 transition-all duration-200"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth trigger */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  id="nav-user-dropdown"
                  className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-left focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 hidden md:inline-block max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50 text-sm animate-fade-in origin-top-right">
                    
                    {/* Header info */}
                    <div className="px-4 py-2 border-b border-gray-50">
                      <span className="block font-bold text-gray-900 truncate">{user.name}</span>
                      <span className="block text-xs text-gray-400 truncate mt-0.5">{user.email}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-[9px] font-bold text-indigo-700 rounded-full uppercase border border-indigo-100">
                        {user.role} role
                      </span>
                    </div>

                    {/* Admin section triggers */}
                    {user.role === 'admin' && (
                      <>
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          to="/admin/products"
                          className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          <span>Manage Products</span>
                        </Link>
                        <div className="border-t border-gray-50"></div>
                      </>
                    )}

                    {/* General user controls */}
                    <Link
                      to="/orders"
                      className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-150"
                    >
                      <User className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50/50 hover:font-semibold transition-colors duration-150 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs md:text-sm font-semibold text-gray-600 hover:text-indigo-600 py-1.5 px-3 rounded-lg hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs md:text-sm px-3.5 py-1.5 md:py-2 rounded-lg hover:shadow-md active:scale-95 transition-all duration-200"
                >
                  Join
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
