import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';

// Layout Components
import Navbar from './components/Navbar.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx';

// Pages
import HomePage from './pages/HomePage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import CartPage from './pages/CartPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import OrderHistoryPage from './pages/OrderHistoryPage.tsx';
import OrderDetailPage from './pages/OrderDetailPage.tsx';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import AdminProductsPage from './pages/AdminProductsPage.tsx';
import AdminOrdersPage from './pages/AdminOrdersPage.tsx';
import AdminUsersPage from './pages/AdminUsersPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          
          <div className="min-h-screen flex flex-col bg-gray-50/20 font-sans">
            {/* Header Navigation Options */}
            <Navbar />

            {/* Main view panel portal */}
            <main className="flex-grow">
              <Routes>
                
                {/* Public Storefront Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Authentication Guest Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Proteced user routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Protected Operations Panels */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProductsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsersPage />
                    </AdminRoute>
                  }
                />

                {/* Catch-all Wildcard routes */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </main>
          </div>

          {/* Toast layout container */}
          <Toaster
            toastOptions={{
              className: 'font-semibold text-sm',
              style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
                padding: '10px 16px'
              }
            }}
          />

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
