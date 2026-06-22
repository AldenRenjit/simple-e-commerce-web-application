import React from 'react';

interface OrderStatusBadgeProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
    processing: 'bg-blue-50 text-blue-700 border-blue-200/60',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
  };

  const labels = {
    pending: 'Pending Payment / Auth',
    processing: 'In Processing',
    shipped: 'Shipped & En Route',
    delivered: 'Delivered & Complete'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${
        status === 'delivered' ? 'bg-emerald-500' :
        status === 'shipped' ? 'bg-indigo-500' :
        status === 'processing' ? 'bg-blue-500' : 'bg-amber-500'
      }`}></span>
      {labels[status]}
    </span>
  );
};

export default OrderStatusBadge;
