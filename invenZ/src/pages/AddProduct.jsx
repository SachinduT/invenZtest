// src/pages/AddProduct.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import ProductForm from '../components/products/ProductForm';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { createProduct, loadProducts } = useProduct();  // ✅ loadProducts එක Add කරන්න
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  // ✅ Categories - ProductForm එකට යවන්න
  const categories = [
    { id: 'Food', name: 'Food' },
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Clothing', name: 'Clothing' },
    { id: 'Books', name: 'Books' },
    { id: 'Home & Garden', name: 'Home & Garden' }
  ];

  // ✅ Suppliers - ProductForm එකට යවන්න
  const suppliers = [
    { id: 'sup1', name: 'Tech Distributors Ltd' },
    { id: 'sup2', name: 'Food Supply Co.' },
    { id: 'sup3', name: 'Fashion Hub' }
  ];

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      
      // ✅ Product එක Create කරනවා
      await createProduct(data);
      
      // ✅ Products Reload කරන්න (නව Product එක පෙන්වන්න)
      await loadProducts();
      
      success('Product added successfully!');
      navigate('/products');
    } catch (err) {
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