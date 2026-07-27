// src/pages/Dashboard.jsx - UPDATED VERSION
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useSupplier } from '../context/SupplierContext';
import { useStock } from '../context/StockContext';
import { useOrder } from '../context/OrderContext';
import { useNotification } from '../context/NotificationContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { products, totalCount, loadProducts } = useProduct();
  const { suppliers, loadSuppliers } = useSupplier();
  const { stockOverview, loadStockOverview, lowStockItems } = useStock();
  const { orderStats, loadOrderStats } = useOrder();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadProducts(),
          loadSuppliers(),
          loadStockOverview(),
          loadOrderStats()
        ]);
      } catch (err) {
        error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleAddProduct = () => navigate('/products/add');
  const handleImportData = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.xls';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Importing file:', file.name);
        success(`Importing ${file.name}...`);
      }
    };
    fileInput.click();
  };
  const handleExportReport = () => navigate('/reports');
  const handleLowStockAlert = () => navigate('/stock');

  // ============================================
  // FEATURE CLICK HANDLERS - UPDATED ✅
  // ============================================

  const handleFeatureClick = (feature) => {
    // If feature is 'dashboard', navigate to '/dashboard'
    if (feature === 'dashboard') {
      navigate('/dashboard'); // Dashboard Page එකටම යයි (Reload වගේ)
      return;
    }
    
    const paths = {
      products: '/products',
      suppliers: '/suppliers',
      stock: '/stock',
      orders: '/orders',
      reports: '/reports'
    };
    navigate(paths[feature] || '/');
  };

  const stats = [
    { 
      icon: '📦', 
      value: totalCount || 0, 
      label: 'Total Products', 
      change: '+12%', 
      color: '#1B5E20',
      bg: '#E8F5E9'
    },
    { 
      icon: '⚠️', 
      value: lowStockItems?.length || 0, 
      label: 'Low Stock Items', 
      change: '+5%', 
      color: '#FF9800',
      bg: '#FFF3E0'
    },
    { 
      icon: '🏢', 
      value: suppliers?.length || 0, 
      label: 'Suppliers', 
      change: '+2', 
      color: '#2E7D32',
      bg: '#E8F5E9'
    },
    { 
      icon: '💰', 
      value: `Rs. ${stockOverview?.totalValue?.toLocaleString() || '0'}`, 
      label: 'Total Value', 
      change: '+8%', 
      color: '#4CAF50',
      bg: '#E8F5E9'
    }
  ];

  const quickActions = [
    { icon: '➕', label: 'Add Product', color: '#1B5E20', action: handleAddProduct },
    { icon: '📥', label: 'Import Data', color: '#2E7D32', action: handleImportData },
    { icon: '📤', label: 'Export Report', color: '#FF9800', action: handleExportReport },
    { icon: '⚠️', label: 'Low Stock Alert', color: '#F44336', action: handleLowStockAlert }
  ];

  const features = [
    { id: 'dashboard', icon: '📊', title: 'Dashboard', description: 'Real-time insights & analytics', color: '#1B5E20' },
    { id: 'products', icon: '📦', title: 'Products', description: 'Complete product management', color: '#2E7D32' },
    { id: 'suppliers', icon: '🏢', title: 'Suppliers', description: 'Manage supplier relationships', color: '#4CAF50' },
    { id: 'stock', icon: '📈', title: 'Stock', description: 'Real-time stock tracking', color: '#FF9800' },
    { id: 'orders', icon: '🛒', title: 'Orders', description: 'Purchase & sales orders', color: '#1B5E20' },
    { id: 'reports', icon: '📋', title: 'Reports', description: 'PDF & Excel reports', color: '#2E7D32' }
  ];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p>Loading your inventory...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-premium">
      {/* Hero Section with Brand */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="brand-badge">
            <span className="brand-icon">🌿</span>
            <span className="brand-name">Inven<span>Z</span></span>
          </div>
          <h1>Welcome to Your Inventory Hub</h1>
          <p className="hero-subtitle">Smart Inventory Management System — Built for Sri Lankan Businesses 🇱🇰</p>
          <div className="hero-stats-mini">
            <span>📦 {totalCount || 0} Products</span>
            <span>🏢 {suppliers?.length || 0} Suppliers</span>
            <span>⚠️ {lowStockItems?.length || 0} Alerts</span>
          </div>
        </div>
        <div className="hero-date">
          <span>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-premium">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card-premium" style={{ borderColor: stat.color }}>
            <div className="stat-icon-premium" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-change">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="main-grid-premium">
        {/* Welcome & Quick Actions */}
        <div className="welcome-card-premium">
          <h2>👋 Welcome to InvenZ!</h2>
          <p>
            Your all-in-one inventory management solution. 
            Track products, manage suppliers, and monitor stock levels in real-time.
          </p>
          
          <div className="quick-actions-premium">
            <h3>⚡ Quick Actions</h3>
            <div className="action-grid-premium">
              {quickActions.map((action, index) => (
                <button 
                  key={index}
                  className="action-btn-premium"
                  style={{ background: action.color }}
                  onClick={action.action}
                >
                  <span>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="alerts-card-premium">
          <div className="alerts-header">
            <span className="alerts-icon">⚠️</span>
            <h3>Low Stock Alerts</h3>
            <span className="alerts-badge">{lowStockItems?.length || 0}</span>
          </div>
          <div className="alerts-list">
            {lowStockItems?.length === 0 ? (
              <div className="no-alerts-premium">
                <span>✅</span>
                <p>All items are well-stocked</p>
                <span className="no-alerts-sub">No action required</span>
              </div>
            ) : (
              lowStockItems.map((item, index) => (
                <div key={index} className="alert-item">
                  <span className="alert-name">{item.name}</span>
                  <span className="alert-stock">{item.currentStock} left</span>
                  <button className="alert-order-btn">Order Now</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section-premium">
        <div className="features-header">
          <h3>✨ Key Features</h3>
          <p>Everything you need to manage your inventory efficiently</p>
        </div>
        <div className="features-grid-premium">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="feature-card-premium"
              onClick={() => handleFeatureClick(feature.id)}
            >
              <div className="feature-icon-premium" style={{ background: feature.color + '15', color: feature.color }}>
                {feature.icon}
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
              <span className="feature-arrow">
                {feature.id === 'dashboard' ? '🔄 Refresh Dashboard' : 'Explore →'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="dashboard-footer">
        <p>🌿 InvenZ — Smart Inventory Management for Sri Lankan Businesses</p>
      </div>
    </div>
  );
};

export default Dashboard;