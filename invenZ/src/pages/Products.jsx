// src/pages/Products.jsx - MODERN REDESIGN WITH FIREBASE
// src/pages/Products.jsx - WITH FORM SUBMIT HANDLER
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getProducts, deleteProduct } from '../services/productService';
import ProductForm from '../components/products/ProductForm';
import ProductDetails from '../components/products/ProductDetails';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { 
    products, 
    categories, 
    loading, 
    loadProducts, 
    loadCategories,
    deleteProduct,
    createProduct,
    updateProduct,
    getProduct,
    totalCount
  } = useProduct();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load products from Firebase
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      setTotalCount(productsData.length);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      showError('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleView = async (product) => {
    try {
      const data = await getProduct(product.id);
      setViewingProduct(data);
    } catch (err) {
      error('Failed to load product details');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      success(`✅ "${product.name}" has been deleted successfully`);
      loadProducts(); // Reload products
    } catch (error) {
      showError('Failed to delete product');
      console.error(error);
    }
  };

  // ✅ FORM SUBMIT HANDLER - Product Add/Update කරාම Reload වෙනවා
  const handleFormSubmit = async (data) => {
    try {
      setFormLoading(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        success('Product updated successfully!');
      } else {
        await createProduct(data);
        success('Product added successfully!');
      }
      setShowForm(false);
      setEditingProduct(null);
      // ✅ Products Reload කරන්න (නව Product එක පෙන්වන්න)
      await loadProducts();
    } catch (err) {
      error(err.message || 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
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
    if (current >= product.maxStock) return { label: 'Overstocked', className: 'overstocked', icon: '🔵' };
    return { label: 'In Stock', className: 'in-stock', icon: '🟢' };
  };

  // Calculate stats
  const lowStockCount = products.filter(p => (p.currentStock || 0) <= (p.minStock || 0)).length;
  const outOfStockCount = products.filter(p => (p.currentStock || 0) === 0).length;
  // View Product Details
  if (viewingProduct) {
    return (
      <ProductDetails
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={() => {
          setViewingProduct(null);
          handleEdit(viewingProduct);
        }}
      />
    );
  }

  // Add/Edit Product Form
  if (showForm) {
    return (
      <div className="products-page-modern">
        <div className="page-header-modern">
          <h1>{editingProduct ? '✏️ Edit Product' : '📦 Add New Product'}</h1>
          <p>{editingProduct ? 'Update product details' : 'Fill in the details to add a new product'}</p>
        </div>
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          categories={categories}
          loading={formLoading}
        />
      </div>
    );
  }

  if (loading) {
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
        <button className="btn-add-modern" onClick={handleAdd}>
          <span>➕</span> Add Product
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar-modern">
        <div className="stat-item">
          <span className="stat-number">{totalCount || 0}</span>
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

          <button className="btn-refresh-modern" onClick={loadProducts} title="Refresh">
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
          <button className="btn-add-modern" onClick={handleAdd}>
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
                    <button className="btn-view" onClick={() => handleView(product)}>👁️</button>
                    <button className="btn-edit" onClick={() => handleEdit(product)}>✏️</button>
                    <button className="btn-delete" onClick={() => handleDelete(product)}>🗑️</button>
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
              <div key={product.id} className="product-card-modern" onClick={() => handleView(product)}>
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
                  <button className="btn-view" onClick={() => handleView(product)}>👁️</button>
                  <button className="btn-edit" onClick={() => handleEdit(product)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(product)}>🗑️</button>
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