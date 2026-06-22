import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.ts';
import { useAuth } from './AuthContext.tsx';
import { CartItemType, CartTotals } from '../types.ts';

interface CartContextType {
  items: CartItemType[];
  totals: CartTotals;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  syncGuestCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ecommerce_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totals, setTotals] = useState<CartTotals>({ subtotal: 0, tax: 0, total: 0 });

  // Calculate totals for guest mode (local state)
  const calculateLocalTotals = (cartItems: CartItemType[]) => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price as string) || 0;
      return sum + (price * item.quantity);
    }, 0);
    const tax = subtotal * 0.10; // 10%
    const total = subtotal + tax;

    setTotals({
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  // Synchronize localStorage items with state
  const loadGuestCart = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItemType[];
        setItems(parsed);
        calculateLocalTotals(parsed);
      } else {
        setItems([]);
        setTotals({ subtotal: 0, tax: 0, total: 0 });
      }
    } catch (err) {
      console.error('Error loading guest cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart from backend DB
  const fetchCart = async () => {
    if (!user) {
      loadGuestCart();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/cart');
      setItems(response.data.items);
      setTotals(response.data.totals);
    } catch (err) {
      console.error('Error fetching database cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync Guest Cart with Server Cart upon login
  const syncGuestCart = async () => {
    try {
      const guestCartJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (guestCartJson && user) {
        const guestItems = JSON.parse(guestCartJson) as CartItemType[];
        if (guestItems.length > 0) {
          console.log('Syncing guest cart to user database...');
          for (const item of guestItems) {
            try {
              await api.post('/cart', {
                product_id: item.product_id,
                quantity: item.quantity
              });
            } catch (err) {
              console.error(`Failed to sync guest product ${item.product_id}:`, err);
            }
          }
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Error merging guest cart on sign-in:', err);
    } finally {
      await fetchCart();
    }
  };

  // Trigger loading cart based on login status
  useEffect(() => {
    if (user) {
      syncGuestCart();
    } else {
      loadGuestCart();
    }
  }, [user]);

  // ADD TO CART action
  const addToCart = async (productId: number, quantity: number = 1) => {
    if (user) {
      // Database synchronization
      try {
        await api.post('/cart', { product_id: productId, quantity });
        await fetchCart();
      } catch (err: any) {
        throw new Error(err.message || 'Failed to add item to cart');
      }
    } else {
      // Guest mode: load, modify, and save to LocalStorage
      try {
        // Fetch product info from public API endpoint to store correct metadata in local cart
        const prodResponse = await api.get(`/products/${productId}`);
        const product = prodResponse.data;

        if (product.stock_qty < quantity) {
          throw new Error('Insufficient stock.');
        }

        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        const currentItems: CartItemType[] = stored ? JSON.parse(stored) : [];

        const existingIdx = currentItems.findIndex(i => i.product_id === productId);
        let updatedItems: CartItemType[] = [];

        if (existingIdx !== -1) {
          const newQty = currentItems[existingIdx].quantity + quantity;
          if (product.stock_qty < newQty) {
            throw new Error(`Insufficient stock. Max available: ${product.stock_qty}`);
          }
          currentItems[existingIdx].quantity = newQty;
          updatedItems = [...currentItems];
        } else {
          const newGuestItem: CartItemType = {
            id: Date.now() + Math.floor(Math.random() * 1000), // temp local ID
            cart_id: 0,
            product_id: productId,
            quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              stock_qty: product.stock_qty,
              is_active: product.is_active
            }
          };
          updatedItems = [...currentItems, newGuestItem];
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
        setItems(updatedItems);
        calculateLocalTotals(updatedItems);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to add item to guest cart.');
      }
    }
  };

  // UPDATE quantity action
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;

    if (user) {
      try {
        await api.put(`/cart/${itemId}`, { quantity });
        await fetchCart();
      } catch (err: any) {
        throw new Error(err.message || 'Failed to adjust quantities.');
      }
    } else {
      // Guest Mode
      const updated = items.map(item => {
        if (item.id === itemId) {
          if (item.product.stock_qty < quantity) {
            throw new Error(`Insufficient stock. Max available: ${item.product.stock_qty}`);
          }
          return { ...item, quantity };
        }
        return item;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      calculateLocalTotals(updated);
    }
  };

  // REMOVE item action
  const removeItem = async (itemId: number) => {
    if (user) {
      try {
        await api.delete(`/cart/${itemId}`);
        await fetchCart();
      } catch (err: any) {
        throw new Error(err.message || 'Failed to remove item.');
      }
    } else {
      const filtered = items.filter(item => item.id !== itemId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      setItems(filtered);
      calculateLocalTotals(filtered);
    }
  };

  // CLEAR cart action (such as post purchase)
  const clearCart = () => {
    if (!user) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setItems([]);
    setTotals({ subtotal: 0, tax: 0, total: 0 });
  };

  return (
    <CartContext.Provider value={{
      items,
      totals,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart,
      syncGuestCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
