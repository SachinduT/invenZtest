// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { products, loading, loadProducts, deleteProduct } = useProduct();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Load products from Context
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        await loadProducts();
        console.log('✅ Products loaded successfully');
      } catch (error) {
        console.error('❌ Error loading products:', error);
        showError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Extract categories from products
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    setCategories(uniqueCategories);
  }, [products]);

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    
    try {
      await deleteProduct(product.id);
      success(`✅ "${product.name}" has been deleted successfully`);
      await loadProducts(); // Reload products
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      showError('Failed to delete product');
    }
  };

  // Filter and Sort Products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name?.localeCompare(b.name);
        case 'price': return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        case 'stock': return (a.currentStock || 0) - (b.currentStock || 0);
        default: return 0;
      }
    });

  // Get stock status
  const getStockStatus = (product) => {
    const current = product.currentStock || 0;
    const min = product.minStock || 5;
    const ratio = current / min;
    
    if (current <= 0) return { label: 'Out of Stock', className: 'out-of-stock', icon: '🚫' };
    if (ratio <= 0.5) return { label: 'Critical', className: 'critical', icon: '🔴' };
    if (ratio <= 1) return { label: 'Low Stock', className: 'low-stock', icon: '🟡' };
    if (current >= (product.maxStock || 100)) return { label: 'Overstocked', className: 'overstocked', icon: '🔵' };
    return { label: 'In Stock', className: 'in-stock', icon: '🟢' };
  };

  // Calculate stats
  const totalCount = products.length;
  const lowStockCount = products.filter(p => (p.currentStock || 0) <= (p.minStock || 0)).length;
  const outOfStockCount = products.filter(p => (p.currentStock || 0) === 0).length;

  if (isLoading || loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page-modern">
      {/* Page Header */}
      <div className="page-header-modern">
        <div>
          <h1>📦 Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <button className="btn-add-modern" onClick={() => navigate('/products/add')}>
          <span>➕</span> Add Product
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar-modern">
        <div className="stat-item">
          <span className="stat-number">{totalCount}</span>
          <span className="stat-label">Total Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{lowStockCount}</span>
          <span className="stat-label">Low Stock</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{outOfStockCount}</span>
          <span className="stat-label">Out of Stock</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-modern">
        <div className="search-box-modern">
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

        <div className="filter-group-modern">
          <select
            className="filter-select-modern"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="filter-select-modern"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
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

          <button className="btn-refresh-modern" onClick={() => loadProducts()} title="Refresh">
            🔄
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state-modern">
          <span className="empty-icon">📭</span>
          <h3>No products found</h3>
          <p>Try adjusting your filters or add a new product</p>
          <button className="btn-add-modern" onClick={() => navigate('/products/add')}>
            + Add Product
          </button>
        </div>
      ) : (
        <div className={`products-container ${viewMode}`}>
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            
            if (viewMode === 'list') {
              return (
                <div key={product.id} className="product-list-item">
                  <div className="list-item-info">
                    <div className="list-item-name">
                      <span className={`status-dot ${stockStatus.className}`}></span>
                      <strong>{product.name}</strong>
                      <span className="list-item-sku">#{product.sku}</span>
                    </div>
                    <div className="list-item-details">
                      <span className="list-item-category">{product.category}</span>
                      <span className="list-item-price">Rs. {product.sellingPrice?.toLocaleString() || '0'}</span>
                      <span className={`list-item-stock ${stockStatus.className}`}>
                        {stockStatus.icon} {product.currentStock || 0} left
                      </span>
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <button 
                      className="btn-view" 
                      onClick={() => navigate(`/products/${product.id}`)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-edit" 
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(product)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            }

            // Grid View
            return (
              <div 
                key={product.id} 
                className="product-card-modern"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="card-image">
                  <span className="product-emoji">📦</span>
                  <span className={`stock-badge ${stockStatus.className}`}>
                    {stockStatus.icon} {stockStatus.label}
                  </span>
                </div>
                <div className="card-content">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-sku">SKU: {product.sku}</p>
                  <p className="product-category">{product.category}</p>
                  
                  <div className="card-pricing">
                    <span className="selling-price">Rs. {product.sellingPrice?.toLocaleString() || '0'}</span>
                    <span className="purchase-price">Cost: Rs. {product.purchasePrice?.toLocaleString() || '0'}</span>
                  </div>

                  <div className="card-stock">
                    <div className="stock-bar">
                      <div 
                        className={`stock-fill ${stockStatus.className}`}
                        style={{ 
                          width: `${Math.min(((product.currentStock || 0) / (product.maxStock || 100)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="stock-count">
                      {product.currentStock || 0} / {product.maxStock || 100}
                    </span>
                  </div>
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="btn-view" 
                    onClick={() => navigate(`/products/${product.id}`)}
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button 
                    className="btn-edit" 
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(product)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;