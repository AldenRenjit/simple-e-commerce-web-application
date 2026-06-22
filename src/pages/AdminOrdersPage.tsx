import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.ts';
import { OrderType } from '../types.ts';
import OrderStatusBadge from '../components/OrderStatusBadge.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import toast from 'react-hot-toast';
import {
  ListOrdered,
  Download,
  Filter,
  Eye,
  Check,
  RefreshCw,
  Search,
  ChevronDown
} from 'lucide-react';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not retrieve order logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  // Handle changing status
  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      toast.success(`Order #${orderId} has been updated to "${nextStatus}".`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || 'Status transition rejected.');
    }
  };

  // Export orders as csv trigger (Hits backend CSV endpoint directly!)
  const handleExportCSV = () => {
    try {
      // Direct file downloader
      const downloadUrl = '/api/orders/export/csv';
      window.open(downloadUrl, '_blank');
      toast.success('Compiling CSV. Download triggered!', { icon: '⬇️' });
    } catch (err) {
      toast.error('Exports pipeline is temporarily offline.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Scanning client checkout logs..." fullPage={true} />;
  }

  // Client search filtering
  const filteredOrders = orders.filter(o => {
    if (!searchTerm.trim()) return true;
    const matchId = o.id.toString().includes(searchTerm.trim());
    const matchName = o.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchId || matchName;
  });

  return (
    <div className="bento-grid-container min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title / Action bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-center gap-2">
              <ListOrdered className="w-7 h-7 text-indigo-650" />
              Comprehensive Orders Manager
            </h1>
            <p className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wide">
              Global client shipping statuses
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchOrders}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-600 inline-flex items-center gap-1 shadow-xs"
              title="Refresh order logs list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-sm"
              title="Export all orders as standard spreadsheet"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Invoice logs</span>
            </button>
          </div>
        </div>

        {/* Filters and search box */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search by ID or recipient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400"
            />
          </div>

          {/* Filter Status Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white transition-all font-sans"
            >
              <option value="">Status Filter: All</option>
              <option value="pending">Pending</option>
              <option value="processing">In Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

        </div>

        {/* List of Orders Table */}
         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             {filteredOrders.length === 0 ? (
               <div className="py-16 text-center text-slate-405 italic text-sm font-semibold">
                 No orders matching the active search criteria are currently listed.
               </div>
             ) : (
               <table className="w-full text-left text-sm border-collapse">
                 
                 <thead>
                   <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                     <th className="py-4.5 px-6">Invoice ID</th>
                     <th className="py-4.5 px-6">Customer Account</th>
                     <th className="py-4.5 px-6">Destination City</th>
                     <th className="py-4.5 px-6">Total Charged</th>
                     <th className="py-4.5 px-6">Current Status</th>
                     <th className="py-4.5 px-6 text-center">Modify State</th>
                     <th className="py-4.5 px-6 text-right">Inspect</th>
                   </tr>
                 </thead>

                 <tbody className="divide-y divide-gray-150 text-gray-700 font-semibold">
                   {filteredOrders.map((ord) => {
                     return (
                       <tr key={ord.id} className="hover:bg-gray-50/20">
                         
                         {/* ID */}
                         <td className="py-4.5 px-6 font-mono text-xs text-indigo-650">
                           #{ord.id}
                         </td>

                         {/* Customer Info */}
                         <td className="py-4.5 px-6">
                           <div>
                             <span className="block font-bold text-gray-900 leading-snug">
                               {ord.shipping_address?.name || 'Guest Checkout'}
                             </span>
                             <span className="block text-[10px] text-gray-400 truncate mt-0.5">
                               {ord.user ? ord.user.email : 'No email info'}
                             </span>
                           </div>
                         </td>

                         {/* Destination */}
                         <td className="py-4.5 px-6 text-gray-600">
                           {ord.shipping_address ? (
                             <span>
                               {ord.shipping_address.city}, {ord.shipping_address.country}
                             </span>
                           ) : (
                             <span className="text-xs italic text-gray-450">Destination Unknown</span>
                           )}
                         </td>

                         {/* Price */}
                         <td className="py-4.5 px-6 font-sans text-gray-950 font-extrabold text-base">
                           ${parseFloat(ord.total_amount as string).toFixed(2)}
                         </td>

                         {/* Tracker Badge */}
                         <td className="py-4.5 px-6">
                           <OrderStatusBadge status={ord.status} />
                         </td>

                         {/* Modify State selectors */}
                         <td className="py-4.5 px-6 text-center">
                           <div className="inline-flex items-center space-x-1.5 relative">
                             <select
                               value={ord.status}
                               onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                               className="bg-gray-50 hover:bg-gray-100 border border-gray-250 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 focus:outline-none transition-all cursor-pointer font-sans"
                             >
                               <option value="pending">Authorize: Pending</option>
                               <option value="processing">Align: Processing</option>
                               <option value="shipped">Deliver: Shipped</option>
                               <option value="delivered">Complete: Delivered</option>
                             </select>
                           </div>
                         </td>

                         {/* Redirect inspect */}
                         <td className="py-4.5 px-6 text-right">
                           <Link
                             to={`/orders/${ord.id}`}
                             className="p-1 px-3 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg inline-flex items-center gap-1 transition-all"
                           >
                             <Eye className="w-4 h-4" />
                             <span>Details</span>
                           </Link>
                         </td>

                       </tr>
                     );
                   })}
                 </tbody>

               </table>
             )}
           </div>
         </div>

      </div>
    </div>
  );
};

export default AdminOrdersPage;
