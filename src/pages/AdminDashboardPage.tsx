import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.ts';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import OrderStatusBadge from '../components/OrderStatusBadge.tsx';
import {
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RotateCw,
  ShoppingBag,
  ListOrdered,
  UsersRound,
  Inbox
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface AdminStats {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    activeUsers: number;
    lowStockProductsCount: number;
  };
  recentOrders: any[];
  topSellingProducts: any[];
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner message="Aggregating administrative reports..." fullPage={true} />;
  }

  const { metrics, recentOrders, topSellingProducts } = stats;

  const chartColors = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <div className="bento-grid-container min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header Navigation Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              Administrative Control Panel
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wide">
              Real-time monitoring & stock tracking
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchStats}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
              title="Refresh Stats"
            >
              <RotateCw className="w-4 h-4" />
              <span>Refresh Reports</span>
            </button>
            <Link
              to="/admin/products"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg hover:shadow-xs transition-all flex items-center gap-1"
            >
              <Package className="w-4.5 h-4.5" />
              <span>Manage Products</span>
            </Link>
            <Link
              to="/admin/orders"
              className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1"
            >
              <ListOrdered className="w-4.5 h-4.5" />
              <span>Manage Orders</span>
            </Link>
            <Link
              to="/admin/users"
              className="bg-emerald-50 border border-emerald-100/50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1"
            >
              <UsersRound className="w-4.5 h-4.5" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>

        {/* 1. Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Revenue Bento Card */}
          <div className="bento-card">
            <div className="flex justify-between items-start">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-trend bg-emerald-50 text-emerald-600 font-bold font-mono">+12.4%</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="stat-value font-mono">
                ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Orders Count Bento Card */}
          <div className="bento-card">
            <div className="flex justify-between items-start">
              <span className="stat-label">Total Orders</span>
              <span className="stat-trend bg-indigo-50 text-indigo-600 font-bold">Active Records</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="stat-value font-mono">
                {metrics.totalOrders}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 3: Active Users Bento Card */}
          <div className="bento-card">
            <div className="flex justify-between items-start">
              <span className="stat-label">Registered Users</span>
              <span className="stat-trend bg-emerald-50 text-emerald-600 font-bold">● Live Auth</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="stat-value font-mono">
                {metrics.activeUsers}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 4: Low Stock Bento Card */}
          <div className="bento-card">
            <div className="flex justify-between items-start">
              <span className="stat-label">Inventory Status</span>
              <span className={`stat-trend font-bold ${
                metrics.lowStockProductsCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-55 bg-indigo-50 text-indigo-600'
              }`}>
                {metrics.lowStockProductsCount > 0 ? `${metrics.lowStockProductsCount} Attention` : 'All Stock OK'}
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className={`stat-value font-mono ${metrics.lowStockProductsCount > 0 ? 'text-amber-605' : ''}`}>
                {metrics.lowStockProductsCount > 0 ? metrics.lowStockProductsCount : 'Healthy'}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metrics.lowStockProductsCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

        {/* 2. Charts and top-selling panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Top selling chart col 1-2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="w-5 h-5 text-indigo-650" />
                <h3 className="font-extrabold text-gray-950 uppercase tracking-wider text-xs">Top Selling Products</h3>
              </div>
              <span className="text-gray-400 text-[10px] font-bold uppercase">Ordered Quantity Count</span>
            </div>

            {topSellingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Inbox className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm font-semibold">No sales recorded yet.</p>
                <p className="text-xs text-gray-400 mt-1">Seeded order charts will display once checkouts are submitted.</p>
              </div>
            ) : (
              <div className="h-64 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingProducts} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fontWeight: 650, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 650, fill: '#6b7280' }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                      {topSellingProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Selling Products quick list table */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-gray-950 uppercase tracking-wider text-xs pb-2 border-b border-gray-50">Top Performers List</h3>
            
            {topSellingProducts.length === 0 ? (
              <p className="text-gray-400 text-xs italic text-center py-10">No items available.</p>
            ) : (
              <div className="divide-y divide-gray-50 text-sm font-semibold space-y-3 pt-1">
                {topSellingProducts.map((prod, idx) => (
                  <div key={prod.id || idx} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-2.5 max-w-[70%]">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-gray-800 line-clamp-1">{prod.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-extrabold text-indigo-650">{prod.sales} units</span>
                      <span className="block text-[10px] text-gray-400">Sum: ${prod.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* 3. Recent 10 Orders log table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-950 uppercase tracking-wider text-xs">Recent 10 System Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-850 flex items-center gap-1"
            >
              <span>See All System Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-gray-450 italic text-sm font-semibold">
                No orders registered in system database yet.
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-6">OrderID</th>
                    <th className="py-4 px-6">Customer Name</th>
                    <th className="py-4 px-6">Customer Email</th>
                    <th className="py-4 px-6">Grand Total</th>
                    <th className="py-4 px-6">Tracker Status</th>
                    <th className="py-4 px-6 text-center">Inspect</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-150 text-gray-700 font-semibold">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/40">
                      
                      {/* ID */}
                      <td className="py-4 px-6 font-mono text-xs text-indigo-650">
                        #{ord.id}
                      </td>

                      {/* Customer Name */}
                      <td className="py-4 px-6 text-gray-900 font-bold">
                        {ord.user ? ord.user.name : ord.shipping_address?.name || 'Guest User'}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-gray-550 text-xs">
                        {ord.user ? ord.user.email : 'No registered email info'}
                      </td>

                      {/* Charged amount */}
                      <td className="py-4 px-6 font-sans text-gray-900 font-extrabold">
                        ${parseFloat(ord.total_amount as string).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <OrderStatusBadge status={ord.status} />
                      </td>

                      {/* Redirect */}
                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/orders/${ord.id}`}
                          className="p-1 px-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 border border-gray-150 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all"
                        >
                          Invoice Details
                        </Link>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
