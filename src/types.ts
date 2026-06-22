export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  is_active?: boolean;
  created_at?: string;
  orderCount?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  category_id: number | null;
  stock_qty: number;
  image_url: string;
  is_active: boolean;
  rating: string | number;
  category?: Category | null;
  created_at?: string;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface CartItemType {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string | number;
    image_url: string;
    stock_qty: number;
    is_active: boolean;
  };
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface OrderItemType {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string | number;
  product?: {
    name: string;
    price: string | number;
    image_url: string;
  };
}

export interface OrderType {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total_amount: string | number;
  shipping_address: ShippingAddress;
  stripe_payment_id?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items?: OrderItemType[];
}
