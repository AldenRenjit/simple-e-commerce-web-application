import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { OrderType } from '../types.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import OrderStatusBadge from '../components/OrderStatusBadge.tsx';
import { ArrowLeft, MapPin, CreditCard, ShoppingCart, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err: any) {
        setErrorMessage(err.message || 'Invoice details are inaccessible.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Locating transaction invoices..." fullPage={true} />;
  }

  if (errorMessage || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Invoice Access Forbidden</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {errorMessage || 'This order does not exist, or you lack permission to inspect other customers accounts.'}
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Order History</span>
        </button>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate timelines
  const phases = ['pending', 'processing', 'shipped', 'delivered'];
  const currentPhaseIndex = phases.indexOf(order.status);

  return (
    <div className="bg-gray-50/70 min-h-screen pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-indigo-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Order Logs</span>
          </Link>
          
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-xs bg-indigo-50 border border-indigo-100 font-extrabold text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
            >
              Back to Operations Panel
            </Link>
          )}
        </div>

        <div className="space-y-6">
          
          {/* 1. Main Header Invoice Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing Receipt</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-950 font-sans font-mono">
                Order #{order.id}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Authorized on {orderDate}</span>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest md:text-right">Transaction Status</span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          {/* 2. visual delivery timeline stepper */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Delivery Tracking Updates</h4>
            
            <div className="grid grid-cols-4 gap-2 relative">
              {phases.map((phase, idx) => {
                const isActive = idx <= currentPhaseIndex;
                const isCurrent = idx === currentPhaseIndex;

                return (
                  <div key={phase} className="flex flex-col items-center relative z-10 text-center">
                    
                    {/* circle indicator */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-3 font-bold text-xs transition-all duration-300 ${
                      isActive 
                        ? 'bg-indigo-650 text-white border-indigo-200' 
                        : 'bg-gray-100 text-gray-400 border-gray-50'
                    } ${isCurrent ? 'ring-4 ring-indigo-100 scale-108 animate-pulse' : ''}`}>
                      {isActive ? '✓' : idx + 1}
                    </div>

                    <span className={`text-[9px] md:text-[10px] font-bold uppercase mt-2.5 tracking-wider ${
                      isActive ? 'text-indigo-900 font-extrabold' : 'text-gray-400'
                    }`}>
                      {phase}
                    </span>

                  </div>
                );
              })}

              {/* Backing connecting line */}
              <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-150 -z-[1]"></div>
              <div
                className="absolute top-4 left-[12.5%] h-0.5 bg-indigo-600 -z-[1] transition-all duration-500"
                style={{ width: `${(currentPhaseIndex / 3) * 75}%` }}
              ></div>
            </div>
          </div>

          {/* 3. Address and payment columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Delivery address destination card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-50">
                <MapPin className="w-4 h-4 text-indigo-650" />
                <h4 className="font-extrabold text-gray-950 uppercase tracking-wider text-xs">Delivery Address</h4>
              </div>
              
              {order.shipping_address ? (
                <div className="text-gray-600 text-sm space-y-1 font-semibold leading-relaxed">
                  <p className="font-extrabold text-gray-900 text-base">{order.shipping_address.name}</p>
                  <p className="font-medium">{order.shipping_address.address}</p>
                  <p className="font-medium">{order.shipping_address.city}, {order.shipping_address.zip}</p>
                  <p className="text-gray-400 text-xs font-bold uppercase">{order.shipping_address.country}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Address parameters missing.</p>
              )}
            </div>

            {/* billing billing details card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3.5">
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-50">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h4 className="font-extrabold text-gray-950 uppercase tracking-wide text-xs">Payment & Billing</h4>
              </div>

              <div className="text-gray-600 text-sm space-y-2.5 font-semibold">
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Stripe Invoice Receipt ID</span>
                  <span className="font-mono text-xs text-gray-800 break-all select-all font-bold">
                    {order.stripe_payment_id || 'MOCK_SANDBOX_TRANS_0001'}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Payment Gateway Method</span>
                  <span className="text-xs text-gray-700 flex items-center gap-1">
                    💳 Visa card (test) ending in •••• 4242
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border border-emerald-100/50 w-max">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fully Cleared & SECURED</span>
                </div>
              </div>
            </div>

          </div>

          {/* 4. Cart Table entries */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-indigo-650" />
              <h4 className="font-extrabold text-gray-950 uppercase tracking-wider text-xs">Items Included</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 text-gray-400 font-bold text-[10px] uppercase border-b border-gray-50">
                    <th className="py-3.5 px-5">Design Name</th>
                    <th className="py-3.5 px-5 text-center">Unit Price</th>
                    <th className="py-3.5 px-5 text-center">Quantity</th>
                    <th className="py-3.5 px-5 text-right">Sum Row Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-gray-800 font-semibold">
                  {order.items?.map((item) => {
                    const priceNum = parseFloat(item.unit_price as string || '0');
                    const summNum = priceNum * item.quantity;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/30">
                        
                        {/* Name and avatar */}
                        <td className="py-4 px-5">
                          <div className="flex items-center space-x-3">
                            {item.product?.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded-lg bg-gray-50"
                              />
                            )}
                            <span className="font-bold text-gray-900 block max-w-sm line-clamp-1">
                              {item.product?.name || `Product ID #${item.product_id}`}
                            </span>
                          </div>
                        </td>

                        {/* Unit price */}
                        <td className="py-4 px-5 text-center font-sans">
                          ${priceNum.toFixed(2)}
                        </td>

                        {/* Quantity */}
                        <td className="py-4 px-5 text-center text-gray-500 font-sans font-bold">
                          {item.quantity}
                        </td>

                        {/* Sum Rows */}
                        <td className="py-4 px-5 text-right font-sans text-gray-900 font-extrabold">
                          ${summNum.toFixed(2)}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total invoice calculations footer */}
            <div className="bg-gray-50/65 p-6 border-t border-gray-100 flex justify-end">
              <div className="w-72 space-y-2.5 text-sm font-semibold">
                <div className="flex justify-between text-gray-500">
                  <span>Authorized Subtotal</span>
                  <span className="font-sans text-gray-900">${(parseFloat(order.total_amount as string) / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Authorised Tax Rate (10% VAT)</span>
                  <span className="font-sans text-gray-900">${(parseFloat(order.total_amount as string) - (parseFloat(order.total_amount as string) / 1.1)).toFixed(2)}</span>
                </div>
                <hr className="border-gray-150" />
                <div className="flex justify-between text-gray-950 font-extrabold text-base pt-1">
                  <span>Amount Fully Paid</span>
                  <span className="font-sans text-xl text-indigo-600 font-extrabold">${parseFloat(order.total_amount as string).toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderDetailPage;
