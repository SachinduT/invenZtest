// src/pages/AddProduct.jsx
import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import ProductForm from '../components/products/ProductForm';
import { addProduct } from '../services/productService';
import { getCategories } from '../services/categoryService';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { createProduct, loadProducts } = useProduct();  // ✅ loadProducts එක Add කරන්න
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [useMockCategories, setUseMockCategories] = useState(false);
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();

  // ✅ MOCK CATEGORIES - Fallback if Firebase categories don't exist
  const mockCategories = [
    { id: 'mock-1', name: 'Electronics' },
    { id: 'mock-2', name: 'Clothing' },
    { id: 'mock-3', name: 'Food & Beverages' },
    { id: 'mock-4', name: 'Furniture' },
    { id: 'mock-5', name: 'Stationery' },
    { id: 'mock-6', name: 'Books' },
    { id: 'mock-7', name: 'Sports & Outdoors' },
    { id: 'mock-8', name: 'Automotive' },
    { id: 'mock-9', name: 'Health & Beauty' },
    { id: 'mock-10', name: 'Home & Garden' },
    { id: 'mock-11', name: 'Toys & Games' },
    { id: 'mock-12', name: 'Office Supplies' }
  ];

  // Load categories from Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categoriesData = await getCategories();
        console.log('📂 Categories loaded from Firebase:', categoriesData);
        
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
          setUseMockCategories(false);
        } else {
          // ✅ Use mock categories if no categories in Firebase
          console.log('📂 No categories in Firebase, using mock categories');
          setCategories(mockCategories);
          setUseMockCategories(true);
        }
      } catch (err) {
        console.error('❌ Error loading categories:', err);
        // ✅ Use mock categories on error
        setCategories(mockCategories);
        setUseMockCategories(true);
        showError('Using sample categories. Add real categories in Firebase.');
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, [showError]);
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

  const handleSubmit = async (productData) => {
    try {
      setLoading(true);
      
      // Add product to Firebase
      const newProduct = await addProduct(productData);
      
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
      showError({
        title: '❌ Failed to Add Product',
        message: error.message || 'Please check your connection and try again.',
        duration: 5000
      });
      console.error('Error adding product:', error);
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
        {useMockCategories && (
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <span className="info-text">
              Using sample categories. You can add your own categories in Firebase Console.
            </span>
          </div>
        )}
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