// src/context/ProductContext.jsx - CONNECTED TO BACKEND
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { productService } from '../services';
import { useNotification } from './NotificationContext';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const { success, error: showError } = useNotification();

  // Load all products
  const loadProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAll(params);
      setProducts(response.data || []);
      setTotalCount(response.total || response.data?.length || 0);
      setLoading(false);
      return response;
    } catch (err) {
      console.error('Load products error:', err);
      setError(err.message || 'Failed to load products');
      showError('Failed to load products');
      setLoading(false);
      throw err;
    }
  }, [showError]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data || []);
      return response;
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  }, []);

  // Get single product
  const getProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getById(id);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Get product error:', err);
      setError(err.message || 'Failed to get product');
      setLoading(false);
      throw err;
    }
  }, []);

  // ✅ CREATE PRODUCT - Add Product Button එක මෙය call කරයි
  const createProduct = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 Creating product:', data);
      
      const response = await productService.create(data);
      console.log('✅ Product created:', response.data);
      
      // Update local state
      setProducts(prev => [response.data, ...prev]);
      setTotalCount(prev => prev + 1);
      
      success('Product created successfully!');
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('❌ Create error:', err);
      setError(err.message || 'Failed to create product');
      showError('Failed to create product');
      setLoading(false);
      throw err;
    }
  }, [success, showError]);

  // Update product
  const updateProduct = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.update(id, data);
      
      setProducts(prev => 
        prev.map(p => p.id === id ? { ...p, ...response.data } : p)
      );
      
      success('Product updated successfully!');
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update product');
      showError('Failed to update product');
      setLoading(false);
      throw err;
    }
  }, [success, showError]);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await productService.delete(id);
      
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotalCount(prev => prev - 1);
      
      success('Product deleted successfully!');
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

  // Load low stock products
  const loadLowStock = useCallback(async () => {
    try {
      const response = await productService.getLowStock();
      setLowStockCount(response.data?.length || 0);
      return response.data;
    } catch (err) {
      console.error('Failed to load low stock:', err);
      return [];
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (query) => {
    try {
      setLoading(true);
      const response = await productService.search(query);
      setLoading(false);
      return response.data || [];
    } catch (err) {
      console.error('Search failed:', err);
      setLoading(false);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadLowStock();
  }, []);

  const value = {
    products,
    categories,
    loading,
    error,
    totalCount,
    lowStockCount,
    loadProducts,
    loadCategories,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    loadLowStock,
    searchProducts
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