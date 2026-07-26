// src/pages/AddProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import ProductForm from '../components/products/ProductForm';
import { addProduct } from '../services/productService';
import { getCategories } from '../services/categoryService';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories from Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getCategories();
        console.log('📂 Categories loaded:', categoriesData);
        
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('❌ Error loading categories:', err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (productData) => {
    try {
      setLoading(true);
      console.log('📦 Adding product:', productData);
      
      // ✅ Add product to Firebase
      const newProduct = await addProduct(productData);
      console.log('✅ Product added successfully:', newProduct);
      
      // Show success message
      success({
        title: '🎉 Product Added Successfully!',
        message: `${newProduct.name} has been added to inventory.`,
        duration: 3000
      });
      
      // Navigate to products page
      setTimeout(() => {
        navigate('/products');
      }, 500);
      
    } catch (error) {
      console.error('❌ Error adding product:', error);
      showError({
        title: '❌ Failed to Add Product',
        message: error.message || 'Please check your connection and try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loadingCategories) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      <div className="page-header">
        <h1>Add New Product</h1>
        <p>Fill in the details to add a new product to your inventory</p>
        <div className="category-count">
          <span className="count-badge">
            📂 {categories.length} Categories Available
          </span>
        </div>
      </div>
      
      <div className="product-form-container">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          categories={categories}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AddProduct;