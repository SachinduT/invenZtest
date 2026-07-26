// src/services/productService.js
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
  serverTimestamp 
} from 'firebase/firestore';
import { auth } from '../firebase/config';

// Collection reference
const productsCollection = collection(db, 'products');

// Add new product to Firebase
export const addProduct = async (productData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to add products');

    const product = {
      name: productData.name,
      sku: productData.sku,
      category: productData.category,
      supplier: productData.supplier || '',
      description: productData.description || '',
      purchasePrice: parseFloat(productData.purchasePrice) || 0,
      sellingPrice: parseFloat(productData.sellingPrice) || 0,
      currentStock: parseInt(productData.currentStock) || 0,
      minStock: parseInt(productData.minStock) || 5,
      maxStock: parseInt(productData.maxStock) || 100,
      unit: productData.unit || 'pcs',
      status: 'active',
      totalSales: 0,
      totalPurchases: 0,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(productsCollection, product);
    console.log('✅ Product added with ID:', docRef.id);
    
    return { 
      id: docRef.id, 
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error adding product:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Get all products from Firebase
export const getProducts = async (filters = {}) => {
  try {
    let q = query(productsCollection, orderBy('createdAt', 'desc'));
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
    
    // Apply search filter in JavaScript
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return products.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    
    console.log('✅ Products loaded:', products.length);
    return products;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
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
    console.error('❌ Error fetching product:', error);
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
      name: productData.name,
      sku: productData.sku,
      category: productData.category,
      supplier: productData.supplier || '',
      description: productData.description || '',
      purchasePrice: parseFloat(productData.purchasePrice) || 0,
      sellingPrice: parseFloat(productData.sellingPrice) || 0,
      currentStock: parseInt(productData.currentStock) || 0,
      minStock: parseInt(productData.minStock) || 5,
      maxStock: parseInt(productData.maxStock) || 100,
      unit: productData.unit || 'pcs',
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedByEmail: user.email
    };

    await updateDoc(docRef, product);
    return { id: productId, ...product };
  } catch (error) {
    console.error('❌ Error updating product:', error);
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
    console.error('❌ Error deleting product:', error);
    throw new Error('Failed to delete product');
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
    console.error('❌ Error updating stock:', error);
    throw new Error('Failed to update stock');
  }
};

// Helper function for error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'permission-denied': "You don't have permission to perform this action.",
    'not-found': 'Product not found.',
    'already-exists': 'A product with this SKU already exists.',
    'unavailable': 'Service is temporarily unavailable. Please try again.'
  };
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

// ✅ Export all functions
const productService = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock
};

export { productService };
export default productService;