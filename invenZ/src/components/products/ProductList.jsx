// src/pages/Products.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const { products, loading, loadProducts } = useProduct();

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>📦 Products</h1>
        <button 
          className="btn-add"
          onClick={() => navigate('/products/add')}
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No products found. Click "Add Product" to create one.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p><strong>SKU:</strong> {product.sku}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Stock:</strong> {product.currentStock} {product.unit}</p>
              <p><strong>Price:</strong> Rs. {product.sellingPrice}</p>
              <span className={`status ${product.currentStock > product.minStock ? 'good' : 'low'}`}>
                {product.currentStock > product.minStock ? '✅ In Stock' : '⚠️ Low Stock'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;