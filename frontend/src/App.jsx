import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';
import { AuthProvider } from './shared/context/AuthContext';

import AdminLayout from './admin/layouts/AdminLayout';
import AuthLayout from './admin/layouts/AuthLayout';
import Dashboard from './admin/pages/Dashboard';
import ProductsAdmin from './admin/pages/Products';
import Categories from './admin/pages/Categories';
import OrdersAdmin from './admin/pages/Orders';
import Customers from './admin/pages/Customers';
import Inventory from './admin/pages/Inventory';
import Analytics from './admin/pages/Analytics';
import Settings from './admin/pages/Settings';
import Profile from './admin/pages/Profile';
import LoginAdmin from './admin/pages/auth/Login';
import ForgotPassword from './admin/pages/auth/ForgotPassword';

import UserLayout from './user/layouts/UserLayout';
import Home from './user/pages/Home';
import Products from './user/pages/Products';
import ProductDetail from './user/pages/ProductDetail';
import Cart from './user/pages/Cart';
import Wishlist from './user/pages/Wishlist';
import Orders from './user/pages/Orders';
import UserProfile from './user/pages/Profile';
import Checkout from './user/pages/Checkout';
import Login from './user/pages/Login';
import Register from './user/pages/Register';

/* ── Film grain overlay (inline — no separate component needed) ── */
function FilmGrainLayer() {
  return (
    <div className="film-grain" aria-hidden="true" />
  );
}

function AppRoutes() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Scene transition on route change
  useEffect(() => {
    prevPath.current = location.pathname;
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="orders" element={<Orders />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="customers" element={<Customers />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilmGrainLayer />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}