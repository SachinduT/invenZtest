// src/pages/Suppliers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getSuppliers, deleteSupplier } from '../services/supplierService';
import './Suppliers.css';

const Suppliers = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load suppliers from Firebase
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersData = await getSuppliers();
      console.log('✅ Suppliers loaded:', suppliersData.length);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('❌ Error loading suppliers:', error);
      showError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Are you sure you want to delete "${supplier.name}"?`)) return;
    
    try {
      await deleteSupplier(supplier.id);
      success(`✅ "${supplier.name}" has been deleted successfully`);
      await loadSuppliers(); // Reload suppliers
    } catch (error) {
      console.error('❌ Error deleting supplier:', error);
      showError('Failed to delete supplier');
    }
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get rating stars
  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '⭐'.repeat(fullStars) + (halfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p>Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div className="suppliers-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>🏢 Suppliers</h1>
          <p>Manage your suppliers</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/suppliers/add')}>
          <span>➕</span> Add Supplier
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{suppliers.length}</span>
          <span className="stat-label">Total Suppliers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{suppliers.filter(s => s.rating >= 4).length}</span>
          <span className="stat-label">Top Rated</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{suppliers.filter(s => s.rating >= 3 && s.rating < 4).length}</span>
          <span className="stat-label">Good Suppliers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{suppliers.filter(s => s.rating < 3 && s.rating > 0).length}</span>
          <span className="stat-label">Needs Review</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search suppliers by name, contact, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
        )}
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <h3>No suppliers found</h3>
          <p>{searchTerm ? 'Try adjusting your search' : 'Add your first supplier'}</p>
          {!searchTerm && (
            <button className="btn-add" onClick={() => navigate('/suppliers/add')}>
              + Add Supplier
            </button>
          )}
        </div>
      ) : (
        <div className="suppliers-grid">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="supplier-card">
              <div className="supplier-header">
                <div className="supplier-avatar">
                  <span className="avatar-icon">🏢</span>
                </div>
                <div className="supplier-name-section">
                  <h3>{supplier.name}</h3>
                  <div className="supplier-rating">
                    {getRatingStars(supplier.rating || 0)}
                    <span className="rating-number">({supplier.rating || 0})</span>
                  </div>
                </div>
              </div>

              <div className="supplier-details">
                {supplier.contactPerson && (
                  <div className="detail-item">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{supplier.contactPerson}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{supplier.address}</span>
                  </div>
                )}
                {supplier.paymentTerms && (
                  <div className="detail-item">
                    <span className="detail-label">Payment:</span>
                    <span className="detail-value">{supplier.paymentTerms}</span>
                  </div>
                )}
              </div>

              <div className="supplier-actions">
                <button 
                  className="btn-view" 
                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                >
                  👁️ View
                </button>
                <button 
                  className="btn-edit" 
                  onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDelete(supplier)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Suppliers;