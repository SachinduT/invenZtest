// src/pages/Stock.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getProducts, updateStock } from '../services/productService';
import './Stock.css';

const Stock = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    categoriesCount: 0
  });

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      
      // Calculate stats
      calculateStats(productsData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading products:', error);
      showError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsData) => {
    const totalItems = productsData.reduce((sum, p) => sum + (p.currentStock || 0), 0);
    const totalValue = productsData.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.purchasePrice || 0)), 0);
    const lowStockCount = productsData.filter(p => (p.currentStock || 0) <= (p.minStock || 0)).length;
    const outOfStockCount = productsData.filter(p => (p.currentStock || 0) === 0).length;
    const categoriesCount = [...new Set(productsData.map(p => p.category).filter(Boolean))].length;

    setStats({
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      categoriesCount
    });
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await updateStock(productId, newStock);
      success('✅ Stock updated successfully!');
      await loadProducts();
    } catch (error) {
      showError('Failed to update stock');
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const getStockStatus = (product) => {
    const current = product.currentStock || 0;
    const min = product.minStock || 5;
    const max = product.maxStock || 100;
    const ratio = current / min;
    
    if (current <= 0) return { label: 'Out of Stock', className: 'out-of-stock', icon: '🚫', color: '#f44336' };
    if (ratio <= 0.5) return { label: 'Critical', className: 'critical', icon: '🔴', color: '#f44336' };
    if (ratio <= 1) return { label: 'Low Stock', className: 'low-stock', icon: '🟡', color: '#ff9800' };
    if (current >= max) return { label: 'Overstocked', className: 'overstocked', icon: '🔵', color: '#2196F3' };
    return { label: 'In Stock', className: 'in-stock', icon: '🟢', color: '#4CAF50' };
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p>Loading stock data...</p>
      </div>
    );
  }

  return (
    <div className="stock-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>📈 Stock Management</h1>
          <p>Monitor and manage your inventory levels</p>
        </div>
        <button className="btn-refresh" onClick={loadProducts}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}>📦</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalItems}</span>
            <span className="stat-label">Total Items</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>💰</div>
          <div className="stat-info">
            <span className="stat-number">Rs. {stats.totalValue.toLocaleString()}</span>
            <span className="stat-label">Total Value</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>⚠️</div>
          <div className="stat-info">
            <span className="stat-number" style={{ color: '#ff9800' }}>{stats.lowStockCount}</span>
            <span className="stat-label">Low Stock</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}>🚫</div>
          <div className="stat-info">
            <span className="stat-number" style={{ color: '#f44336' }}>{stats.outOfStockCount}</span>
            <span className="stat-label">Out of Stock</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>🏷️</div>
          <div className="stat-info">
            <span className="stat-number">{stats.categoriesCount}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⊞
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
      </div>

      {/* Stock Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <h3>No products found</h3>
          <p>Try adjusting your filters or add new products</p>
        </div>
      ) : (
        <div className={`stock-container ${viewMode}`}>
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            
            if (viewMode === 'list') {
              return (
                <div key={product.id} className="stock-list-item">
                  <div className="list-item-info">
                    <div className="list-item-name">
                      <span className={`status-dot ${stockStatus.className}`}></span>
                      <strong>{product.name}</strong>
                      <span className="list-item-sku">#{product.sku}</span>
                    </div>
                    <div className="list-item-details">
                      <span className="list-item-category">{product.category}</span>
                      <span className="list-item-price">Rs. {product.purchasePrice?.toLocaleString() || '0'}</span>
                      <span className={`list-item-stock ${stockStatus.className}`}>
                        {stockStatus.icon} {product.currentStock || 0} units
                      </span>
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <div className="stock-control">
                      <button 
                        className="btn-stock-adjust"
                        onClick={() => handleUpdateStock(product.id, (product.currentStock || 0) + 1)}
                      >
                        +1
                      </button>
                      <button 
                        className="btn-stock-adjust"
                        onClick={() => handleUpdateStock(product.id, Math.max(0, (product.currentStock || 0) - 1))}
                      >
                        -1
                      </button>
                    </div>
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      👁️
                    </button>
                  </div>
                </div>
              );
            }

            // Grid View
            return (
              <div key={product.id} className="stock-card">
                <div className="stock-card-header">
                  <span className="product-emoji">📦</span>
                  <span className={`stock-badge ${stockStatus.className}`}>
                    {stockStatus.icon} {stockStatus.label}
                  </span>
                </div>
                <div className="stock-card-body">
                  <h4>{product.name}</h4>
                  <p className="product-sku">SKU: {product.sku}</p>
                  <p className="product-category">{product.category}</p>
                  
                  <div className="stock-details">
                    <div className="detail-item">
                      <span className="label">Current Stock:</span>
                      <span className="value" style={{ color: stockStatus.color }}>
                        {product.currentStock || 0} {product.unit || 'pcs'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Min Stock:</span>
                      <span className="value">{product.minStock || 0}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Max Stock:</span>
                      <span className="value">{product.maxStock || 100}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Price:</span>
                      <span className="value">Rs. {product.purchasePrice?.toLocaleString() || '0'}</span>
                    </div>
                  </div>

                  <div className="stock-bar">
                    <div 
                      className={`stock-fill ${stockStatus.className}`}
                      style={{ 
                        width: `${Math.min(((product.currentStock || 0) / (product.maxStock || 100)) * 100, 100)}%` 
                      }}
                    />
                  </div>

                  <div className="stock-controls">
                    <button 
                      className="btn-adjust"
                      onClick={() => handleUpdateStock(product.id, Math.max(0, (product.currentStock || 0) - 1))}
                    >
                      −
                    </button>
                    <span className="stock-count">{product.currentStock || 0}</span>
                    <button 
                      className="btn-adjust"
                      onClick={() => handleUpdateStock(product.id, (product.currentStock || 0) + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="btn-adjust-large"
                      onClick={() => handleUpdateStock(product.id, (product.currentStock || 0) + 10)}
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stock;