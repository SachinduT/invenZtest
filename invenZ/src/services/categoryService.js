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
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { auth } from '../firebase/config';

const categoriesCollection = collection(db, 'categories');

// Get all categories
export const getCategories = async () => {
  try {
    console.log('🔍 Fetching categories from Firebase...');
    const q = query(categoriesCollection, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('📭 No categories found');
      return [];
    }
    
    const categories = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unnamed',
        description: data.description || '',
        icon: data.icon || '📦',
        color: data.color || '#1B5E20',
        count: data.count || 0,
        ...data
      };
    });
    
    console.log('✅ Categories loaded:', categories.length);
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

// Add new category
export const addCategory = async (categoryData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const category = {
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || '📦',
      color: categoryData.color || '#1B5E20',
      count: 0,
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(categoriesCollection, category);
    return { id: docRef.id, ...category };
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error(error.message || 'Failed to add category');
  }
};

// Update category
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const docRef = doc(db, 'categories', categoryId);
    const category = {
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || '📦',
      color: categoryData.color || '#1B5E20',
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
    if (!user) throw new Error('User must be logged in');

    const docRef = doc(db, 'categories', categoryId);
    await deleteDoc(docRef);
    return { id: categoryId, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  try {
    const docRef = doc(db, 'categories', categoryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Unnamed',
        description: data.description || '',
        icon: data.icon || '📦',
        color: data.color || '#1B5E20',
        count: data.count || 0,
        ...data
      };
    } else {
      throw new Error('Category not found');
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    throw new Error('Failed to load category');
  }
};