// src/services/supplierService.js
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
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { auth } from '../firebase/config';

// Collection reference
const suppliersCollection = collection(db, 'suppliers');

// Add new supplier to Firebase
export const addSupplier = async (supplierData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to add suppliers');

    const supplier = {
      name: supplierData.name,
      contactPerson: supplierData.contactPerson || '',
      email: supplierData.email || '',
      phone: supplierData.phone || '',
      address: supplierData.address || '',
      website: supplierData.website || '',
      taxNumber: supplierData.taxNumber || '',
      paymentTerms: supplierData.paymentTerms || '',
      rating: parseFloat(supplierData.rating) || 0,
      status: 'active',
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(suppliersCollection, supplier);
    console.log('✅ Supplier added with ID:', docRef.id);
    
    return { 
      id: docRef.id, 
      ...supplier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error adding supplier:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Get all suppliers from Firebase
export const getSuppliers = async (filters = {}) => {
  try {
    let q = query(suppliersCollection, orderBy('name', 'asc'));
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    const querySnapshot = await getDocs(q);
    const suppliers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));
    
    // Apply search filter in JavaScript
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return suppliers.filter(s => 
        s.name?.toLowerCase().includes(searchLower) ||
        s.contactPerson?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower)
      );
    }
    
    console.log('✅ Suppliers loaded:', suppliers.length);
    return suppliers;
  } catch (error) {
    console.error('❌ Error fetching suppliers:', error);
    throw new Error('Failed to load suppliers');
  }
};

// Get single supplier by ID
export const getSupplierById = async (supplierId) => {
  try {
    const docRef = doc(db, 'suppliers', supplierId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    } else {
      throw new Error('Supplier not found');
    }
  } catch (error) {
    console.error('❌ Error fetching supplier:', error);
    throw new Error('Failed to load supplier details');
  }
};

// Update supplier
export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to update suppliers');

    const docRef = doc(db, 'suppliers', supplierId);
    const supplier = {
      name: supplierData.name,
      contactPerson: supplierData.contactPerson || '',
      email: supplierData.email || '',
      phone: supplierData.phone || '',
      address: supplierData.address || '',
      website: supplierData.website || '',
      taxNumber: supplierData.taxNumber || '',
      paymentTerms: supplierData.paymentTerms || '',
      rating: parseFloat(supplierData.rating) || 0,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedByEmail: user.email
    };

    await updateDoc(docRef, supplier);
    return { id: supplierId, ...supplier };
  } catch (error) {
    console.error('❌ Error updating supplier:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

// Delete supplier
export const deleteSupplier = async (supplierId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to delete suppliers');

    const docRef = doc(db, 'suppliers', supplierId);
    await deleteDoc(docRef);
    return { id: supplierId, message: 'Supplier deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting supplier:', error);
    throw new Error('Failed to delete supplier');
  }
};

// Get top rated suppliers
export const getTopRatedSuppliers = async (limit = 10) => {
  try {
    const q = query(suppliersCollection, orderBy('rating', 'desc'), where('rating', '>', 0));
    const querySnapshot = await getDocs(q);
    const suppliers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return suppliers.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching top rated suppliers:', error);
    return [];
  }
};

// Helper function for error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'permission-denied': "You don't have permission to perform this action.",
    'not-found': 'Supplier not found.',
    'unavailable': 'Service is temporarily unavailable. Please try again.'
  };
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

// ✅ Export all functions
const supplierService = {
  addSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getTopRatedSuppliers
};

export { supplierService };
export default supplierService;