// src/pages/AddProduct.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import ProductForm from '../components/products/ProductForm';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { createProduct, loadProducts } = useProduct();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: '1', name: 'Food' },
    { id: '2', name: 'Electronics' },
    { id: '3', name: 'Clothing' },
    { id: '4', name: 'Books' },
    { id: '5', name: 'Home & Garden' }
  ];

  const suppliers = [
    { id: '1', name: 'Tech Distributors Ltd' },
    { id: '2', name: 'Food Supply Co.' },
    { id: '3', name: 'Fashion Hub' }
  ];

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      console.log('📝 Submitting product:', data);
      
      await createProduct(data);
      await loadProducts();
      
      success('Product added successfully!');
      navigate('/products');
    } catch (err) {
      console.error('❌ Error:', err);
      error(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>📦 Add New Product</h1>
        <p>Fill in the details to add a new product to inventory</p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/products')}
        categories={categories}
        suppliers={suppliers}
        loading={loading}
      />
    </div>
  );
};

export default AddProduct;