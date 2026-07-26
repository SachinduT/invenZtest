// src/services/categoryService.js
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

const categoriesCollection = collection(db, 'categories');

// Get all categories
export const getCategories = async () => {
  try {
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
    console.log('✅ Categories loaded:', categories.length);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Get single category by ID
export const getCategoryById = async (categoryId) => {
  try {
    const docRef = doc(db, 'categories', categoryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    } else {
      throw new Error('Category not found');
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error('Failed to load category');
  }
};

// Add new category
export const addCategory = async (categoryData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to add categories');

    // Check if category with same name exists
    const existingCategories = await getCategories();
    const exists = existingCategories.some(c => 
      c.name.toLowerCase() === categoryData.name.toLowerCase()
    );
    
    if (exists) {
      throw new Error('A category with this name already exists');
    }

    const category = {
      ...categoryData,
      count: 0,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(categoriesCollection, category);
    return { 
      id: docRef.id, 
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error(error.message || 'Failed to add category');
  }
};

// Update category
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to update categories');

    const docRef = doc(db, 'categories', categoryId);
    
    // Check if another category with same name exists
    const existingCategories = await getCategories();
    const exists = existingCategories.some(c => 
      c.id !== categoryId && 
      c.name.toLowerCase() === categoryData.name.toLowerCase()
    );
    
    if (exists) {
      throw new Error('A category with this name already exists');
    }

    const category = {
      ...categoryData,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedByEmail: user.email
    };

    await updateDoc(docRef, category);
    return { id: categoryId, ...category };
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error(error.message || 'Failed to update category');
  }
};

// Delete category
export const deleteCategory = async (categoryId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to delete categories');

    const docRef = doc(db, 'categories', categoryId);
    await deleteDoc(docRef);
    return { id: categoryId, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
};

// Get categories with product counts
export const getCategoriesWithCounts = async () => {
  try {
    // Get all categories
    const categories = await getCategories();
    
    // Get all products to count per category
    const { getProducts } = await import('./productService');
    const products = await getProducts();
    
    // Count products per category
    const categoryCounts = {};
    products.forEach(product => {
      if (product.category) {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
      }
    });
    
    // Add count to each category
    return categories.map(category => ({
      ...category,
      count: categoryCounts[category.name] || 0
    }));
  } catch (error) {
    console.error('Error getting categories with counts:', error);
    return [];
  }
};