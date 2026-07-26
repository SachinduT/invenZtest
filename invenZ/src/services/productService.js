// src/services/productService.js
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