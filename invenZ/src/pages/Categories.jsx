// src/pages/Categories.jsx - COMPLETE FUNCTIONAL VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import './Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const { products, categories: productCategories, loadProducts, loadCategories } = useProduct();
  const { success, error } = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    color: '#1B5E20'
  });

  // Icons and Colors
  const icons = ['📦', '💻', '🍔', '👕', '📚', '🏠', '⚡', '🎮', '📱', '🎨', '🏢', '🛒', '📊', '⚙️', '🎯', '🔧', '🖥️', '📷', '🎵', '✈️', '🥗', '☕', '🍕', '🧸', '🎸'];
  const colors = ['#1B5E20', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#E91E63', '#00BCD4', '#795548', '#607D8B', '#8BC34A', '#FF5722', '#3F51B5', '#009688'];

  // Load categories
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadProducts();
      await loadCategories();
      
      // Calculate category counts from products
      const productCategoryCounts = products.reduce((acc, product) => {
        const catName = product.category || 'Uncategorized';
        acc[catName] = (acc[catName] || 0) + 1;
        return acc;
      }, {});

      // Merge with existing categories or create new ones
      let categoryList = [];
      
      if (productCategories && productCategories.length > 0) {
        // Use existing categories and update counts
        categoryList = productCategories.map(cat => ({
          ...cat,
          count: productCategoryCounts[cat.name] || 0
        }));
      } else {
        // Create from product categories
        categoryList = Object.keys(productCategoryCounts).map((name, index) => ({
          id: index + 1,
          name: name,
          description: `${name} products`,
          icon: getCategoryIcon(name),
          color: getCategoryColor(name),
          count: productCategoryCounts[name],
          createdAt: new Date().toISOString().split('T')[0]
        }));
      }

      setCategories(categoryList);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Fallback to default categories
      setCategories(getDefaultCategories(products));
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get icon based on category name
  const getCategoryIcon = (name) => {
    const iconMap = {
      'Food': '🍔',
      'Electronics': '💻',
      'Clothing': '👕',
      'Books': '📚',
      'Home': '🏠',
      'Garden': '🌱',
      'Toys': '🧸',
      'Sports': '⚽',
      'Music': '🎵',
      'Automotive': '🚗'
    };
    return iconMap[name] || '📦';
  };

  // Helper: Get color based on category name
  const getCategoryColor = (name) => {
    const colorMap = {
      'Food': '#FF9800',
      'Electronics': '#1B5E20',
      'Clothing': '#4CAF50',
      'Books': '#2196F3',
      'Home': '#9C27B0',
      'Garden': '#4CAF50',
      'Toys': '#E91E63',
      'Sports': '#F44336',
      'Music': '#9C27B0',
      'Automotive': '#607D8B'
    };
    return colorMap[name] || '#1B5E20';
  };

  // Default categories from products
  const getDefaultCategories = (productList) => {
    const counts = {};
    productList.forEach(p => {
      const cat = p.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map((name, index) => ({
      id: index + 1,
      name: name,
      description: `${name} products`,
      icon: getCategoryIcon(name),
      color: getCategoryColor(name),
      count: counts[name],
      createdAt: new Date().toISOString().split('T')[0]
    }));
  };

  // Filter categories
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add Category
  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '📦', color: '#1B5E20' });
    setShowForm(true);
  };

  // Edit Category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📦',
      color: category.color || '#1B5E20'
    });
    setShowForm(true);
  };

  // Delete Category
  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    try {
      setCategories(categories.filter(c => c.id !== category.id));
      success('Category deleted successfully!');
    } catch (err) {
      error('Failed to delete category');
    }
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Category name is required');
      return;
    }

    const newCategory = {
      id: editingCategory ? editingCategory.id : Date.now(),
      ...formData,
      count: editingCategory ? editingCategory.count : 0,
      createdAt: editingCategory ? editingCategory.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? newCategory : c));
      success('Category updated successfully!');
    } else {
      setCategories([...categories, newCategory]);
      success('Category added successfully!');
    }

    setShowForm(false);
    setEditingCategory(null);
  };

  // Get product count color
  const getCountColor = (count) => {
    if (count === 0) return '#999';
    if (count < 5) return '#FF9800';
    if (count < 10) return '#2196F3';
    return '#4CAF50';
  };

  // Stats
  const totalCategories = categories.length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.count || 0), 0);
  const activeCategories = categories.filter(c => (c.count || 0) > 0).length;
  const emptyCategories = categories.filter(c => (c.count || 0) === 0).length;

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>🏷️ Categories</h1>
          <p>Manage your product categories</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          <span>➕</span> Add Category
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{totalCategories}</span>
          <span className="stat-label">Total Categories</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalProducts}</span>
          <span className="stat-label">Total Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{activeCategories}</span>
          <span className="stat-label">Active Categories</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{emptyCategories}</span>
          <span className="stat-label">Empty Categories</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search categories by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="form-overlay">
          <div className="form-card">
            <div className="form-header">
              <h3>{editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                  rows="2"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-picker">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${formData.icon === icon ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? 'active' : ''}`}
                        style={{ background: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-submit">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏷️</span>
          <h3>No categories found</h3>
          <p>{searchTerm ? 'Try adjusting your search' : 'Create your first category to organize your products'}</p>
          {!searchTerm && (
            <button className="btn-add" onClick={handleAdd}>+ Add Category</button>
          )}
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map((category) => (
            <div key={category.id} className="category-card" style={{ borderColor: category.color }}>
              <div className="category-icon" style={{ background: category.color + '15', color: category.color }}>
                {category.icon || '📦'}
              </div>
              <div className="category-info">
                <h4>{category.name}</h4>
                <p>{category.description || 'No description'}</p>
                <div className="category-meta">
                  <span 
                    className="category-count" 
                    style={{ background: getCountColor(category.count || 0) }}
                  >
                    {category.count || 0} products
                  </span>
                  <span className="category-date">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
              <div className="category-actions">
                <button className="btn-edit" onClick={() => handleEdit(category)} title="Edit">
                  ✏️
                </button>
                <button className="btn-delete" onClick={() => handleDelete(category)} title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;