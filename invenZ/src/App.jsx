// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { 
  AuthProvider, 
  NotificationProvider, 
  ProductProvider, 
  SupplierProvider, 
  StockProvider, 
  OrderProvider,
  ThemeProvider 
} from './context';
import './App.css';

// Import all pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Charts from './pages/Charts';
import Profile from './pages/Profile';
import Suppliers from './pages/Suppliers';
import AddSupplier from './pages/AddSupplier';
import SupplierDetails from './pages/SupplierDetails';
import Stock from './pages/Stock';
import StockMovements from './pages/StockMovements';
import Orders from './pages/Orders';
import PurchaseOrders from './pages/PurchaseOrders';
import SalesOrders from './pages/SalesOrders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <ProductProvider>
            <SupplierProvider>
              <StockProvider>
                <OrderProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* ============================================
                          DASHBOARD
                          ============================================ */}
                      <Route path="/" element={<Layout><Dashboard /></Layout>} />
                      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                      
                      {/* ============================================
                          CATEGORIES
                          ============================================ */}
                      <Route path="/categories" element={<Layout><Categories /></Layout>} />
                      
                      {/* ============================================
                          CHARTS
                          ============================================ */}
                      <Route path="/charts" element={<Layout><Charts /></Layout>} />
                      
                      {/* ============================================
                          PROFILE
                          ============================================ */}
                      <Route path="/settings/profile" element={<Layout><Profile /></Layout>} />
                      
                      {/* ============================================
                          PRODUCTS
                          ============================================ */}
                      <Route path="/products" element={<Layout><Products /></Layout>} />
                      <Route path="/products/add" element={<Layout><AddProduct /></Layout>} />
                      <Route path="/products/edit/:id" element={<Layout><EditProduct /></Layout>} />
                      <Route path="/products/:id" element={<Layout><ProductDetails /></Layout>} />
                      
                      {/* ============================================
                          SUPPLIERS
                          ============================================ */}
                      <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
                      <Route path="/suppliers/add" element={<Layout><AddSupplier /></Layout>} />
                      <Route path="/suppliers/:id" element={<Layout><SupplierDetails /></Layout>} />
                      
                      {/* ============================================
                          STOCK
                          ============================================ */}
                      <Route path="/stock" element={<Layout><Stock /></Layout>} />
                      <Route path="/stock/movements" element={<Layout><StockMovements /></Layout>} />
                      
                      {/* ============================================
                          ORDERS
                          ============================================ */}
                      <Route path="/orders" element={<Layout><Orders /></Layout>} />
                      <Route path="/orders/purchase" element={<Layout><PurchaseOrders /></Layout>} />
                      <Route path="/orders/sales" element={<Layout><SalesOrders /></Layout>} />
                      
                      {/* ============================================
                          REPORTS
                          ============================================ */}
                      <Route path="/reports" element={<Layout><Reports /></Layout>} />
                      
                      {/* ============================================
                          SETTINGS
                          ============================================ */}
                      <Route path="/settings" element={<Layout><Settings /></Layout>} />
                      
                      {/* ============================================
                          AUTH (Public Routes)
                          ============================================ */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      
                      {/* ============================================
                          404 NOT FOUND
                          ============================================ */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </OrderProvider>
              </StockProvider>
            </SupplierProvider>
          </ProductProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;