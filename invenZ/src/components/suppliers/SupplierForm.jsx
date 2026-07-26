// src/components/suppliers/SupplierForm.jsx
import React, { useState } from 'react';
import './SupplierForm.css';

const SupplierForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contactPerson: initialData?.contactPerson || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    website: initialData?.website || '',
    taxNumber: initialData?.taxNumber || '',
    paymentTerms: initialData?.paymentTerms || '',
    rating: initialData?.rating || 0
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Supplier name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 0 and 5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        rating: parseFloat(formData.rating) || 0
      });
    }
  };

  return (
    <form className="supplier-form" onSubmit={handleSubmit}>
      <h3>{initialData ? '✏️ Edit Supplier' : '➕ Add New Supplier'}</h3>

      <div className="form-grid">
        <div className="form-group">
          <label>Supplier Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="Enter supplier name"
            disabled={loading}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Contact Person</label>
          <input
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Enter contact person"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            placeholder="Enter email address"
            disabled={loading}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="2"
          placeholder="Enter address"
          disabled={loading}
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Website</label>
          <input
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Enter website URL"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Tax Number</label>
          <input
            name="taxNumber"
            value={formData.taxNumber}
            onChange={handleChange}
            placeholder="Enter tax number"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Payment Terms</label>
          <input
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            placeholder="e.g., Net 30"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Rating (0-5)</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="5"
            step="0.5"
            className={errors.rating ? 'error' : ''}
            placeholder="0"
            disabled={loading}
          />
          {errors.rating && <span className="error-text">{errors.rating}</span>}
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
            initialData ? 'Update Supplier' : 'Add Supplier'
          )}
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;