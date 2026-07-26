// src/pages/AddSupplier.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import SupplierForm from '../components/suppliers/SupplierForm';
import { addSupplier } from '../services/supplierService';
import './AddSupplier.css';

const AddSupplier = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (supplierData) => {
    try {
      setLoading(true);
      console.log('📦 Adding supplier:', supplierData);
      
      // ✅ Add supplier to Firebase
      const newSupplier = await addSupplier(supplierData);
      console.log('✅ Supplier added successfully:', newSupplier);
      
      // Show success message
      success({
        title: '🎉 Supplier Added Successfully!',
        message: `${newSupplier.name} has been added to suppliers.`,
        duration: 3000
      });
      
      // Navigate to suppliers page
      setTimeout(() => {
        navigate('/suppliers');
      }, 500);
      
    } catch (error) {
      console.error('❌ Error adding supplier:', error);
      showError({
        title: '❌ Failed to Add Supplier',
        message: error.message || 'Please check your connection and try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/suppliers');
  };

  return (
    <div className="add-supplier-page">
      <div className="page-header">
        <h1>Add New Supplier</h1>
        <p>Fill in the details to add a new supplier</p>
      </div>
      
      <div className="supplier-form-container">
        <SupplierForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AddSupplier;