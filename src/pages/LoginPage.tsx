import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Return to page user wanted to visit, or home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast.success('Signed in successfully!', { position: 'bottom-right' });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to quick fill testing credentials
  const fillCredentials = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('user@example.com');
      setPassword('user123');
    }
    toast.success(`Loaded credentials for standard ${role}!`);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-lg relative">
        
        {/* App Greeting */}
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-650 mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 font-sans">
            Welcome back Page
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Securely sign in to access your cart, checkouts, and order lists
          </p>
        </div>

        {/* Credentials Fill Prompts (Very helpful for AI Studio test environments!) */}
        <div id="auth-test-credentials" className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-indigo-850 font-bold text-xs uppercase tracking-wide">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Developer Quick-Fill Accounts</span>
          </div>
          <p className="text-xs text-indigo-700/80 leading-relaxed">
            Click to fill pre-seeded Sequelize database identities:
          </p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => fillCredentials('admin')}
              className="py-1.5 px-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-750 border border-indigo-200/50 rounded-lg text-xs font-bold transition-all"
            >
              Fill Admin Account
            </button>
            <button
              onClick={() => fillCredentials('user')}
              className="py-1.5 px-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-705 border border-emerald-200/50 rounded-lg text-xs font-bold transition-all"
            >
              Fill User Account
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            {/* Email field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 pl-11 pr-11 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all duration-300 ${
              loading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <span>{loading ? 'Verifying profile...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-50">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-850 hover:underline">
            Register custom profile
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
