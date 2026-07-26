// src/services/categoryService.js
import { db } from '../firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const categoriesCollection = collection(db, 'categories');

export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(categoriesCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(categoriesCollection, categoryData);
    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};