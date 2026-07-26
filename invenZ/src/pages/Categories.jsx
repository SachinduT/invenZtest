// src/pages/Categories.jsx - COMPLETE WITH REDESIGNED STATS CARDS
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../services/categoryService';
import './Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    color: '#1B5E20'
  });

  // Icons and Colors
  const icons = ['📦', '💻', '🍔', '👕', '📚', '🏠', '⚡', '🎮', '📱', '🎨', '🏢', '🛒', '📊', '⚙️', '🎯', '🔧', '🖥️', '📷', '🎵', '✈️', '🥗', '☕', '🍕', '🧸', '🎸'];
  const colors = ['#1B5E20', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#E91E63', '#00BCD4', '#795548', '#607D8B', '#8BC34A', '#FF5722', '#3F51B5', '#009688'];

  // Load categories from Firebase
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      
      // If no categories from Firebase, use mock data
      if (!categoriesData || categoriesData.length === 0) {
        const mockCategories = [
          { id: 1, name: 'Electronics', description: 'Electronic items and gadgets', icon: '💻', color: '#1B5E20', count: 15, createdAt: '2026-07-20' },
          { id: 2, name: 'Food & Beverage', description: 'Food products and drinks', icon: '🍔', color: '#FF9800', count: 23, createdAt: '2026-07-21' },
          { id: 3, name: 'Clothing', description: 'Apparel and fashion', icon: '👕', color: '#4CAF50', count: 8, createdAt: '2026-07-22' },
          { id: 4, name: 'Books', description: 'Books and publications', icon: '📚', color: '#2196F3', count: 12, createdAt: '2026-07-23' },
          { id: 5, name: 'Home & Garden', description: 'Home and garden items', icon: '🏠', color: '#9C27B0', count: 6, createdAt: '2026-07-24' }
        ];
        setCategories(mockCategories);
      } else {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Use mock data on error
      const mockCategories = [
        { id: 1, name: 'Electronics', description: 'Electronic items and gadgets', icon: '💻', color: '#1B5E20', count: 15, createdAt: '2026-07-20' },
        { id: 2, name: 'Food & Beverage', description: 'Food products and drinks', icon: '🍔', color: '#FF9800', count: 23, createdAt: '2026-07-21' },
        { id: 3, name: 'Clothing', description: 'Apparel and fashion', icon: '👕', color: '#4CAF50', count: 8, createdAt: '2026-07-22' },
        { id: 4, name: 'Books', description: 'Books and publications', icon: '📚', color: '#2196F3', count: 12, createdAt: '2026-07-23' },
        { id: 5, name: 'Home & Garden', description: 'Home and garden items', icon: '🏠', color: '#9C27B0', count: 6, createdAt: '2026-07-24' }
      ];
      setCategories(mockCategories);
      showError('Using sample categories');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get count color
  const getCountColor = (count) => {
    if (count === 0) return '#ffebee';
    if (count < 5) return '#fff3e0';
    if (count < 10) return '#e8f5e9';
    return '#1B5E20';
  };

  // Filter categories
  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalCategories = categories.length;
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);
  const activeCategories = categories.filter(cat => (cat.count || 0) > 0).length;
  const emptyCategories = categories.filter(cat => (cat.count || 0) === 0).length;

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
      await deleteCategory(category.id);
      await loadCategories();
      success(`✅ "${category.name}" deleted successfully!`);
    } catch (err) {
      showError(err.message || 'Failed to delete category');
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        success(`✅ "${categoryData.name}" updated successfully!`);
      } else {
        await addCategory(categoryData);
        success(`✅ "${categoryData.name}" added successfully!`);
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '📦', color: '#1B5E20' });
      await loadCategories();
      
    } catch (err) {
      showError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Stats Bar - Modern Cards Design */}
      <div className="stats-bar-modern">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e8f5e9' }}>
            <span className="stat-icon">🏷️</span>
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalCategories}</span>
            <span className="stat-label">Total Categories</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e3f2fd' }}>
            <span className="stat-icon">📦</span>
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalProducts}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#e8f5e9' }}>
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-info">
            <span className="stat-number">{activeCategories}</span>
            <span className="stat-label">Active Categories</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fff3e0' }}>
            <span className="stat-icon">📭</span>
          </div>
          <div className="stat-info">
            <span className="stat-number">{emptyCategories}</span>
            <span className="stat-label">Empty Categories</span>
          </div>
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
              <button 
                className="close-btn" 
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                ✕
              </button>
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
                  disabled={submitting}
                  maxLength={50}
                />
                <small className="char-count">{formData.name.length}/50</small>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description (optional)"
                  rows="2"
                  disabled={submitting}
                  maxLength={200}
                />
                <small className="char-count">{formData.description.length}/200</small>
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
                        disabled={submitting}
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
                        disabled={submitting}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-small"></span>
                      {editingCategory ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingCategory ? 'Update Category' : 'Add Category'
                  )}
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
            <div key={category.id} className="category-card" style={{ borderColor: category.color || '#1B5E20' }}>
              <div className="category-icon" style={{ background: (category.color || '#1B5E20') + '15', color: category.color || '#1B5E20' }}>
                {category.icon || '📦'}
              </div>
              <div className="category-info">
                <h4>{category.name}</h4>
                <p>{category.description || 'No description'}</p>
                <div className="category-meta">
                  <span 
                    className="category-count" 
                    style={{ background: getCountColor(category.count || 0), color: category.count === 0 ? '#666' : '#fff' }}
                  >
                    {category.count || 0} products
                  </span>
                  <span className="category-date">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
              <div className="category-actions">
                <button className="btn-edit" onClick={() => handleEdit(category)}>✏️</button>
                <button className="btn-delete" onClick={() => handleDelete(category)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;