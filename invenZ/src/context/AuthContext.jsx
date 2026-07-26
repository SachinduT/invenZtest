// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Demo Users - Fallback if Firebase fails
const DEMO_USERS = [
  { 
    id: 1, 
    name: 'Admin', 
    email: 'admin@invenz.com', 
    password: 'admin123', 
    role: 'Administrator',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=1B5E20&color=fff&bold=true&size=40'
  },
  { 
    id: 2, 
    name: 'Manager', 
    email: 'manager@invenz.com', 
    password: 'manager123', 
    role: 'Manager',
    avatar: 'https://ui-avatars.com/api/?name=Manager&background=2E7D32&color=fff&bold=true&size=40'
  },
  { 
    id: 3, 
    name: 'Staff User', 
    email: 'staff@invenz.com', 
    password: 'staff123', 
    role: 'Staff',
    avatar: 'https://ui-avatars.com/api/?name=Staff&background=4CAF50&color=fff&bold=true&size=40'
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Get error message helper
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Email already in use. Please try another email.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    return errorMessages[errorCode] || 'Authentication failed. Please try again.';
  };

  const buildSessionUser = (profileData = {}, fallbackUser = null) => {
    const fallbackName = fallbackUser?.displayName || fallbackUser?.email?.split('@')[0] || 'User';
    const name = profileData.name || fallbackUser?.displayName || fallbackUser?.email?.split('@')[0] || 'User';
    const email = profileData.email || fallbackUser?.email || '';
    const avatar = profileData.avatar || fallbackUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4CAF50&color=fff&bold=true&size=40`;

    return {
      ...profileData,
      id: profileData.uid || fallbackUser?.uid || profileData.id || null,
      name,
      email,
      role: profileData.role || 'User',
      avatar,
    };
  };

  // ✅ Sign up with email and password (Firebase)
  const signup = async (email, password, userData) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: userData.name || userData.fullName
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: userData.name || userData.fullName,
        role: userData.role || 'User',
        createdAt: new Date().toISOString(),
        ...userData
      });

      setLoading(false);
      return { user, message: 'Account created successfully!' };
    } catch (error) {
      setLoading(false);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // ✅ Login with email and password (Firebase)
  const loginWithFirebase = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const profileData = userDoc.exists() ? userDoc.data() : {};
      const sessionUser = buildSessionUser(profileData, user);

      setUserProfile(sessionUser);
      setUser(sessionUser);
      setCurrentUser(sessionUser);
      setIsAuthenticated(true);
      localStorage.setItem('auth_user', JSON.stringify(sessionUser));
      
      setLoading(false);
      return { user: sessionUser, message: 'Login successful!' };
    } catch (error) {
      setLoading(false);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // ✅ Login - Demo Mode (Fallback)
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try Firebase login first
      try {
        const result = await loginWithFirebase(email, password);
        setLoading(false);
        return result;
      } catch (firebaseError) {
        // If Firebase fails, try demo users
        console.log('Firebase login failed, trying demo users...');
        const foundUser = DEMO_USERS.find(u => 
          u.email === email && u.password === password
        );
        
        if (!foundUser) {
          throw new Error('❌ Invalid email or password. Please try again.');
        }
        
        // Create user session from demo
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          avatar: foundUser.avatar
        };
        
        setUser(userData);
        setCurrentUser(userData);
        setUserProfile(userData);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        localStorage.setItem('token', 'demo-token-12345');
        
        setLoading(false);
        return { user: userData, message: 'Login successful! (Demo Mode)' };
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  // ✅ Register - Demo Mode
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if email already exists in demo users
      const existingUser = DEMO_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already exists. Please login.');
      }
      
      // Create new user in demo
      const newUser = {
        id: DEMO_USERS.length + 1,
        name: userData.name || 'User',
        email: userData.email,
        password: userData.password,
        role: 'Staff',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=4CAF50&color=fff&bold=true&size=40`
      };
      
      DEMO_USERS.push(newUser);
      
      // Login the new user
      const userSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      };
      
      setUser(userSession);
      setCurrentUser(userSession);
      setUserProfile(userSession);
      setIsAuthenticated(true);
      localStorage.setItem('auth_user', JSON.stringify(userSession));
      localStorage.setItem('token', 'demo-token-12345');
      
      setLoading(false);
      return { user: userSession, message: 'Account created successfully!' };
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      // Try Firebase logout
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.log('Firebase logout failed, clearing local session...');
    }
    
    // Clear all sessions
    setUser(null);
    setCurrentUser(null);
    setUserProfile(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    
    return { message: 'Logged out successfully' };
  };

  // ✅ Update profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      setUserProfile(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      // Update DEMO_USERS array
      const userIndex = DEMO_USERS.findIndex(u => u.email === user?.email);
      if (userIndex !== -1) {
        DEMO_USERS[userIndex].name = userData.name || DEMO_USERS[userIndex].name;
      }
      
      setLoading(false);
      return { user: updatedUser, message: 'Profile updated successfully!' };
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
      throw err;
    }
  };

  // ✅ Change Password with validation
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find user in DEMO_USERS array
      const userIndex = DEMO_USERS.findIndex(u => u.email === user?.email);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // ✅ Verify current password
      if (DEMO_USERS[userIndex].password !== currentPassword) {
        throw new Error('❌ Current password is incorrect');
      }
      
      // ✅ Check if new password is same as current
      if (currentPassword === newPassword) {
        throw new Error('❌ New password must be different from current password');
      }
      
      // ✅ Check password length
      if (newPassword.length < 6) {
        throw new Error('❌ New password must be at least 6 characters');
      }
      
      // ✅ Update password in DEMO_USERS
      DEMO_USERS[userIndex].password = newPassword;
      
      console.log('✅ Password changed successfully for:', user?.email);
      
      setLoading(false);
      return { success: true, message: 'Password changed successfully!' };
    } catch (err) {
      setError(err.message || 'Failed to change password');
      setLoading(false);
      throw err;
    }
  };

  // ✅ Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const foundUser = DEMO_USERS.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('Email not found. Please check your email address.');
      }
      
      setLoading(false);
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
      setLoading(false);
      throw err;
    }
  };

  // ✅ Reset password
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      setLoading(false);
      return { success: true, message: 'Password reset successfully!' };
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      setLoading(false);
      throw err;
    }
  };

  // ✅ Get current user
  const getCurrentUser = () => {
    return currentUser || user;
  };

  // ✅ Check if user has role
  const hasRole = (role) => {
    const userData = currentUser || user;
    return userData?.role === role;
  };

  // ✅ Set up auth state listener (Firebase)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const profileData = userDoc.exists() ? userDoc.data() : {};
          const sessionUser = buildSessionUser(profileData, firebaseUser);

          setUserProfile(sessionUser);
          setCurrentUser(sessionUser);
          setUser(sessionUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // ✅ Check localStorage for demo user
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setCurrentUser(userData);
          setUserProfile(userData);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser: currentUser || user,
    userProfile: userProfile || user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    register,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    hasRole,
    users: DEMO_USERS
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};