// src/components/products/ProductForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProductForm.css';

const ProductForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel,
  categories = [],
  loading = false
}) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    category: initialData?.category || '',
    supplier: initialData?.supplier || '',
    description: initialData?.description || '',
    purchasePrice: initialData?.purchasePrice || '',
    sellingPrice: initialData?.sellingPrice || '',
    currentStock: initialData?.currentStock || 0,
    minStock: initialData?.minStock || 5,
    maxStock: initialData?.maxStock || 100,
    unit: initialData?.unit || 'pcs'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.purchasePrice && formData.purchasePrice < 0) newErrors.purchasePrice = 'Price cannot be negative';
    if (formData.sellingPrice && formData.sellingPrice < 0) newErrors.sellingPrice = 'Price cannot be negative';
    if (formData.minStock < 0) newErrors.minStock = 'Min stock cannot be negative';
    if (formData.maxStock < formData.minStock) newErrors.maxStock = 'Max stock must be greater than min stock';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const productData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        currentStock: parseInt(formData.currentStock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        maxStock: parseInt(formData.maxStock) || 0,
        createdBy: currentUser?.uid || 'unknown',
        createdByEmail: currentUser?.email || 'unknown'
      };
      
      onSubmit(productData);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="Enter product name"
            disabled={loading}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>SKU *</label>
          <input
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className={errors.sku ? 'error' : ''}
            placeholder="Enter SKU (e.g., PRD-001)"
            disabled={loading}
          />
          {errors.sku && <span className="error-text">{errors.sku}</span>}
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
            disabled={loading}
          >
            <option value=""> Select Category </option>
            {categories && categories.length > 0 ? (
              categories.map((cat, index) => (
                <option 
                  key={cat.id || `cat-${index}`} 
                  value={cat.name || cat}
                >
                  {cat.icon && <span className="category-icon">{cat.icon}</span>}
                  {cat.name || cat}
                  {cat.count !== undefined && ` (${cat.count})`}
                </option>
              ))
            ) : (
              <option value="" disabled>No categories available</option>
            )}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
          {categories.length === 0 && (
            <span className="warning-text">⚠️ Please add categories first</span>
          )}
        </div>

        <div className="form-group">
          <label>Supplier</label>
          <input
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Enter supplier name"
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          placeholder="Product description..."
          disabled={loading}
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Purchase Price (Rs.)</label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={errors.purchasePrice ? 'error' : ''}
            disabled={loading}
            placeholder="0.00"
          />
          {errors.purchasePrice && <span className="error-text">{errors.purchasePrice}</span>}
        </div>

        <div className="form-group">
          <label>Selling Price (Rs.)</label>
          <input
            type="number"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={errors.sellingPrice ? 'error' : ''}
            disabled={loading}
            placeholder="0.00"
          />
          {errors.sellingPrice && <span className="error-text">{errors.sellingPrice}</span>}
        </div>

        <div className="form-group">
          <label>Current Stock</label>
          <input
            type="number"
            name="currentStock"
            value={formData.currentStock}
            onChange={handleChange}
            min="0"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="pcs">Pieces (pcs)</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="l">Liter (l)</option>
            <option value="ml">Milliliter (ml)</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Min Stock Level</label>
          <input
            type="number"
            name="minStock"
            value={formData.minStock}
            onChange={handleChange}
            min="0"
            className={errors.minStock ? 'error' : ''}
            disabled={loading}
          />
          {errors.minStock && <span className="error-text">{errors.minStock}</span>}
        </div>

        <div className="form-group">
          <label>Max Stock Level</label>
          <input
            type="number"
            name="maxStock"
            value={formData.maxStock}
            onChange={handleChange}
            min="0"
            className={errors.maxStock ? 'error' : ''}
            disabled={loading}
          />
          {errors.maxStock && <span className="error-text">{errors.maxStock}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-small"></span>
              {initialData ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            initialData ? 'Update Product' : 'Add Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;