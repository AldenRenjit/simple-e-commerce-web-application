import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('Registration successful! Created your e-commerce profile.');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please make sure email is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-lg relative">
        
        {/* Welcome titles */}
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-650 mx-auto mb-4">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 font-sans">
            Create an Account
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Sign up to get started, track orders, and experience faster checking
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3.5">
            
            {/* Full Name field */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email Address field */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">If email contains word "admin", it will get seeded with Admin roles automatically!</p>
            </div>

            {/* Passwords fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="reg-pass" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1"
                    title="Toggle Visibility"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
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
            <span>{loading ? 'Creating workspace...' : 'Sign Up'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-50">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-850 hover:underline">
            Sign In here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
