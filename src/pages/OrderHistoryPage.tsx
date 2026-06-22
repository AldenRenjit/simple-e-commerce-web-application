import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.ts';
import { OrderType } from '../types.ts';
import OrderStatusBadge from '../components/OrderStatusBadge.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { ShoppingBag, Eye, ArrowLeft, ArrowUpDown } from 'lucide-react';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching user orders history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Assembling order history transcripts..." fullPage={true} />;
  }

  const hasNoOrders = orders.length === 0;

  return (
    <div className="bg-gray-50/70 min-h-screen pb-16 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb back */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors duration-155 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront Page</span>
        </Link>

        <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-gray-950 font-sans mb-8">
          My Order History
        </h1>

        {hasNoOrders ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-xs">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-550 mx-auto mb-5">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1.5">No Registered Orders</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-6">
              You haven't checked out any baskets yet. Visit our items grid to secure Noise-Cancelling Headphones, Smart Fitness Watches or standard books!
            </p>
            <Link
              to="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg hover:shadow-md active:scale-95 transition-all shadow-sm"
            >
              Start Shopping Now
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[10px] tracking-wider font-extrabold">
                    <th className="py-4.5 px-6">Invoice ID</th>
                    <th className="py-4.5 px-6">Purchase Date</th>
                    <th className="py-4.5 px-6">Grand Total</th>
                    <th className="py-4.5 px-6">OrderStatus</th>
                    <th className="py-4.5 px-6 text-center">Receipt Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-semibold text-gray-800">
                  {orders.map((order) => {
                    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                        
                        {/* Order ID */}
                        <td className="py-4.5 px-6 font-mono text-xs text-gray-750">
                          #{order.id}
                        </td>

                        {/* Date */}
                        <td className="py-4.5 px-6 text-gray-650 font-sans">
                          {orderDate}
                        </td>

                        {/* Total Amount */}
                        <td className="py-4.5 px-6 font-sans text-base font-extrabold text-gray-950">
                          ${parseFloat(order.total_amount as string).toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="py-4.5 px-6">
                          <OrderStatusBadge status={order.status} />
                        </td>

                        {/* Details button redirection */}
                        <td className="py-4.5 px-6 text-center">
                          <Link
                            to={`/orders/${order.id}`}
                            className="bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 px-3.5 py-1.5 rounded-lg border border-gray-150 text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                            title={`Inspect Invoice #${order.id}`}
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Invoice</span>
                          </Link>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderHistoryPage;
