// src/context/AuthContext.jsx
// src/context/AuthContext.jsx - AUTO LOGIN + DEMO MODE WITH PASSWORD VALIDATION
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

// ✅ Demo Users
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

  // Sign up with email and password
  const signup = async (email, password, userData) => {
    try {
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

      return { user, message: 'Account created successfully!' };
    } catch (error) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
      
      return { user, message: 'Login successful!' };
    } catch (error) {
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new Error('Failed to logout');
    }
  };

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

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
  // ✅ Auto Login for Demo
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for saved user in localStorage first
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // ✅ Auto Login for Demo (No Backend needed)
        const demoUser = {
          id: 1,
          name: 'Admin',
          email: 'admin@invenz.com',
          role: 'Administrator',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=1B5E20&color=fff&bold=true&size=40'
        };
        setUser(demoUser);
        setIsAuthenticated(true);
        localStorage.setItem('auth_user', JSON.stringify(demoUser));
        localStorage.setItem('token', 'demo-token-12345');
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // ✅ Login - Demo Mode
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Find user by email and password
      const foundUser = DEMO_USERS.find(u => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('❌ Invalid email or password. Please try again.');
      }
      
      // Create user session
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        avatar: foundUser.avatar
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('token', 'demo-token-12345');
      
      setLoading(false);
      return { data: { user: userData, token: 'demo-token-12345' } };
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register - Demo Mode
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if email already exists
      const existingUser = DEMO_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already exists. Please login.');
      }
      
      // Create new user
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
      setIsAuthenticated(true);
      localStorage.setItem('auth_user', JSON.stringify(userSession));
      localStorage.setItem('token', 'demo-token-12345');
      
      setLoading(false);
      return { data: { user: userSession, token: 'demo-token-12345' } };
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
  };

  // ✅ Update profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      // Update DEMO_USERS array
      const userIndex = DEMO_USERS.findIndex(u => u.email === user?.email);
      if (userIndex !== -1) {
        DEMO_USERS[userIndex].name = userData.name || DEMO_USERS[userIndex].name;
      }
      
      setLoading(false);
      return { data: { user: updatedUser } };
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change Password - UPDATED WITH VALIDATION
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
      
      // ✅ Log success
      console.log('✅ Password changed successfully for:', user?.email);
      console.log('📝 New password:', newPassword);
      
      setLoading(false);
      return { success: true, message: 'Password changed successfully!' };
    } catch (err) {
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
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
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset password
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      setError(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser
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