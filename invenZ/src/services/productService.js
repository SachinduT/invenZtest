// src/services/productService.js
// src/services/productService.js - DEMO MODE (No Backend)
import api from './api';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { auth } from '../firebase/config';

// Collection reference
const productsCollection = collection(db, 'products');

// Add new product
export const addProduct = async (productData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to add products');

    const product = {
      ...productData,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      totalSales: 0,
      totalPurchases: 0
    };

    const docRef = await addDoc(productsCollection, product);
    return { 
      id: docRef.id, 
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Get all products
export const getProducts = async (filters = {}) => {
  try {
    let q = query(productsCollection, orderBy('createdAt', 'desc'));
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.search) {
      const allProducts = await getDocs(q);
      const products = allProducts.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }));
      return products.filter(p => 
        p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to load products');
  }
};

// Get single product by ID
export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to load product details');
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to update products');

    const docRef = doc(db, 'products', productId);
    const product = {
      ...productData,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedByEmail: user.email
    };

    await updateDoc(docRef, product);
    return { id: productId, ...product };
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to delete products');

    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return { id: productId, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const q = query(productsCollection, where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('Failed to load products by category');
  }
};

// Get low stock products
export const getLowStockProducts = async () => {
  try {
    const querySnapshot = await getDocs(productsCollection);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return products.filter(product => {
      const currentStock = Number(product.currentStock) || 0;
      const minStock = Number(product.minStock) || 5;
      return currentStock <= minStock;
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
};

// Get products by stock level threshold
export const getProductsByStockLevel = async (threshold = 5) => {
  try {
    const q = query(productsCollection, where('currentStock', '<=', threshold));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products by stock level:', error);
    throw new Error('Failed to load products by stock level');
  }
};

// Get out of stock products
export const getOutOfStockProducts = async () => {
  try {
    const q = query(productsCollection, where('currentStock', '==', 0));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching out of stock products:', error);
    throw new Error('Failed to load out of stock products');
  }
};

// Update stock
export const updateStock = async (productId, newStock) => {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      currentStock: newStock,
      updatedAt: serverTimestamp()
    });
    return { id: productId, currentStock: newStock };
  } catch (error) {
    console.error('Error updating stock:', error);
    throw new Error('Failed to update stock');
  }
};

// Bulk update stock
export const bulkUpdateStock = async (updates) => {
  try {
    const batch = [];
    for (const { id, stock } of updates) {
      const docRef = doc(db, 'products', id);
      batch.push(updateDoc(docRef, {
        currentStock: stock,
        updatedAt: serverTimestamp()
      }));
// ✅ Mock data (Backend නැතුව වැඩ කරන්න)
const MOCK_PRODUCTS = [
  { 
    id: 1, 
    name: 'Premium Rice', 
    sku: 'RICE-001', 
    category: 'Food', 
    supplier: 'Food Supply Co.', 
    currentStock: 45, 
    minStock: 10, 
    maxStock: 100, 
    purchasePrice: 120, 
    sellingPrice: 150, 
    unit: 'kg', 
    status: 'good' 
  },
  { 
    id: 2, 
    name: 'Sugar', 
    sku: 'SUGAR-001', 
    category: 'Food', 
    supplier: 'Food Supply Co.', 
    currentStock: 8, 
    minStock: 10, 
    maxStock: 50, 
    purchasePrice: 80, 
    sellingPrice: 100, 
    unit: 'kg', 
    status: 'low' 
  },
  { 
    id: 3, 
    name: 'Laptop', 
    sku: 'LAP-001', 
    category: 'Electronics', 
    supplier: 'Tech Distributors', 
    currentStock: 2, 
    minStock: 5, 
    maxStock: 20, 
    purchasePrice: 45000, 
    sellingPrice: 55000, 
    unit: 'pcs', 
    status: 'critical' 
  },
  { 
    id: 4, 
    name: 'Wheat Flour', 
    sku: 'FLOUR-001', 
    category: 'Food', 
    supplier: 'Food Supply Co.', 
    currentStock: 45, 
    minStock: 15, 
    maxStock: 80, 
    purchasePrice: 90, 
    sellingPrice: 120, 
    unit: 'kg', 
    status: 'good' 
  },
];

export const productService = {
  // ✅ Get all products (Mock)
  getAll: async (params = {}) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let products = [...MOCK_PRODUCTS];
      
      // Filter by search
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
        );
      }
      
      return { data: products, total: products.length };
    } catch (error) {
      throw { message: 'Failed to fetch products' };
    }
  },
  
  // ✅ Get product by ID (Mock)
  getById: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const product = MOCK_PRODUCTS.find(p => p.id === parseInt(id));
      if (!product) {
        throw new Error('Product not found');
      }
      return { data: product };
    } catch (error) {
      throw { message: error.message || 'Failed to fetch product' };
    }
  },
  
  // ✅ Create new product (Mock)
  create: async (data) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProduct = {
        ...data,
        id: MOCK_PRODUCTS.length + 1,
        status: data.currentStock > data.minStock ? 'good' : 'low'
      };
      
      MOCK_PRODUCTS.push(newProduct);
      console.log('✅ Product created:', newProduct);
      console.log('📦 Total products:', MOCK_PRODUCTS.length);
      
      return { data: newProduct };
    } catch (error) {
      throw { message: 'Failed to create product' };
    }
  },
  
  // ✅ Update product (Mock)
  update: async (id, data) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const index = MOCK_PRODUCTS.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw new Error('Product not found');
      }
      
      MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...data };
      console.log('✅ Product updated:', MOCK_PRODUCTS[index]);
      
      return { data: MOCK_PRODUCTS[index] };
    } catch (error) {
      throw { message: error.message || 'Failed to update product' };
    }
  },
  
  // ✅ Delete product (Mock)
  delete: async (id) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = MOCK_PRODUCTS.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        throw new Error('Product not found');
      }
      
      MOCK_PRODUCTS.splice(index, 1);
      console.log('✅ Product deleted. Remaining:', MOCK_PRODUCTS.length);
      
      return { data: { success: true } };
    } catch (error) {
      throw { message: error.message || 'Failed to delete product' };
    }
  },
  
  // ✅ Get low stock products (Mock)
  getLowStock: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const lowStock = MOCK_PRODUCTS.filter(p => p.currentStock <= p.minStock);
      return { data: lowStock };
    } catch (error) {
      throw { message: 'Failed to fetch low stock products' };
    }
  },
  
  // ✅ Search products (Mock)
  search: async (query) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const results = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
      );
      return { data: results };
    } catch (error) {
      throw { message: 'Failed to search products' };
    }
  },

  // ✅ Get categories (Mock)
  getCategories: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
      return { data: categories.map(c => ({ id: c, name: c })) };
    } catch (error) {
      throw { message: 'Failed to fetch categories' };
    }
    await Promise.all(batch);
    return { message: `${updates.length} products updated successfully` };
  } catch (error) {
    console.error('Error bulk updating stock:', error);
    throw new Error('Failed to bulk update stock');
  }
};

// ✅ CREATE THE productService OBJECT WITH ALL FUNCTIONS
const productService = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getLowStockProducts,
  getProductsByStockLevel,
  getOutOfStockProducts,
  updateStock,
  bulkUpdateStock
};

// ✅ EXPORT productService as a named export
export { productService };

// ✅ Also export the default export
export default productService;

// Helper function for error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'permission-denied': 'You don\'t have permission to perform this action.',
    'not-found': 'Product not found.',
    'already-exists': 'A product with this SKU already exists.',
    'unavailable': 'Service is temporarily unavailable. Please try again.'
  };
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};