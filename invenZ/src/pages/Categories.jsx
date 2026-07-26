// src/pages/Categories.jsx
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
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    color: '#1B5E20'
  });

  // Load categories from Firebase
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '📦', color: '#1B5E20' });
    setShowForm(true);
  };

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

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;
    
    try {
      await deleteCategory(category.id);
      await loadCategories(); // Reload categories
      success(`✅ "${category.name}" deleted successfully!`);
    } catch (err) {
      showError(err.message || 'Failed to delete category');
    }
  };

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
        // Update existing category
        await updateCategory(editingCategory.id, categoryData);
        success(`✅ "${categoryData.name}" updated successfully!`);
      } else {
        // Add new category
        await addCategory(categoryData);
        success(`✅ "${categoryData.name}" added successfully!`);
      }

      // Reload categories and close form
      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '📦', color: '#1B5E20' });
      
    } catch (err) {
      showError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const icons = ['📦', '💻', '🍔', '👕', '📚', '🏠', '⚡', '🎮', '📱', '🎨', '🏢', '🛒', '📊', '⚙️', '🎯', '🔧', '📷', '🎵', '✏️', '🧹'];
  const colors = ['#1B5E20', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#E91E63', '#00BCD4', '#795548', '#607D8B', '#FF5722', '#8BC34A'];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="categories-page-modern">
      {/* Page Header */}
      <div className="page-header-modern">
        <div>
          <h1>🏷️ Categories</h1>
          <p>Manage your product categories</p>
        </div>
        <button className="btn-add-modern" onClick={handleAdd}>
          <span>➕</span> Add Category
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar-modern">
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">Total Categories</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.reduce((sum, c) => sum + (c.count || 0), 0)}</span>
          <span className="stat-label">Total Products</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.filter(c => (c.count || 0) > 0).length}</span>
          <span className="stat-label">Active Categories</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.filter(c => (c.count || 0) === 0).length}</span>
          <span className="stat-label">Empty Categories</span>
        </div>
      </div>

      {/* Add/Edit Form */}
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
      {categories.length === 0 ? (
        <div className="empty-state-modern">
          <span className="empty-icon">🏷️</span>
          <h3>No categories yet</h3>
          <p>Create your first category to organize your products</p>
          <button className="btn-add-modern" onClick={handleAdd}>+ Add Category</button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card" style={{ borderColor: category.color || '#1B5E20' }}>
              <div className="category-icon" style={{ 
                background: (category.color || '#1B5E20') + '15', 
                color: category.color || '#1B5E20' 
              }}>
                {category.icon || '📦'}
              </div>
              <div className="category-info">
                <h4>{category.name}</h4>
                <p>{category.description || 'No description'}</p>
                <span className="category-count">{category.count || 0} products</span>
              </div>
              <div className="category-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => handleEdit(category)}
                  title="Edit Category"
                >
                  ✏️
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(category)}
                  title="Delete Category"
                >
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