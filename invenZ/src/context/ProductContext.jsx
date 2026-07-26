// src/context/ProductContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import productService from '../services/productService';
import { useNotification } from './NotificationContext';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const { success, error: showError } = useNotification();

  const loadProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(params);
      setProducts(response || []);
      setTotalCount(response?.length || 0);
      setLoading(false);
      return response;
    } catch (err) {
      console.error('Load products error:', err);
      setError(err.message || 'Failed to load products');
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const products = await productService.getProducts();
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories.map(name => ({ id: name, name })));
      return uniqueCategories;
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  }, []);

  // ✅ CREATE PRODUCT
  const createProduct = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.addProduct(data);
      
      setProducts(prev => [response, ...prev]);
      setTotalCount(prev => prev + 1);
      
      success('Product created successfully! 🎉');
      setLoading(false);
      return response;
    } catch (err) {
      console.error('❌ Create error:', err);
      setError(err.message || 'Failed to create product');
      showError('Failed to create product');
      setLoading(false);
      throw err;
    }
  }, [success, showError]);

  // ✅ DELETE PRODUCT
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => prev - 1);
      success('Product deleted successfully! 🗑️');
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete product');
      showError('Failed to delete product');
      setLoading(false);
      throw err;
    }
  }, [success, showError]);

  // Initial load
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const value = {
    products,
    categories,
    loading,
    error,
    totalCount,
    loadProducts,
    loadCategories,
    createProduct,
    deleteProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;