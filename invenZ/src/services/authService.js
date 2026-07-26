// src/services/authService.js - DEMO MODE (Backend නැතුව)
import api from './api';

// ✅ Demo users for testing
const DEMO_USERS = [
  { id: 1, name: 'Admin', email: 'admin@invenz.com', password: 'admin123', role: 'Administrator' },
  { id: 2, name: 'Manager', email: 'manager@invenz.com', password: 'manager123', role: 'Manager' },
  { id: 3, name: 'Staff', email: 'staff@invenz.com', password: 'staff123', role: 'Staff' }
];

export const authService = {
  // ✅ Demo Login (No Backend)
  login: async (email, password) => {
    try {
      // Find user in demo list
      const foundUser = DEMO_USERS.find(u => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Create user session
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      };
      
      localStorage.setItem('token', 'demo-token-12345');
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { 
        success: true, 
        message: 'Login successful',
        data: { user: userData, token: 'demo-token-12345' }
      };
    } catch (error) {
      throw { message: error.message || 'Login failed' };
    }
  },

  // ✅ Demo Register (No Backend)
  register: async (userData) => {
    try {
      const existingUser = DEMO_USERS.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
      
      const newUser = {
        id: DEMO_USERS.length + 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'Staff'
      };
      
      DEMO_USERS.push(newUser);
      
      return { 
        success: true, 
        message: 'Registration successful',
        data: { user: newUser }
      };
    } catch (error) {
      throw { message: error.message || 'Registration failed' };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Forgot password (Demo)
  forgotPassword: async (email) => {
    const foundUser = DEMO_USERS.find(u => u.email === email);
    if (!foundUser) {
      throw { message: 'Email not found' };
    }
    return { success: true, message: 'Reset link sent to your email' };
  },

  // Reset password (Demo)
  resetPassword: async (token, password) => {
    return { success: true, message: 'Password reset successfully' };
  },

  // Update profile (Demo)
  updateProfile: async (userData) => {
    const user = authService.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, data: { user: updatedUser } };
    }
    throw { message: 'User not found' };
  },

  // Change password (Demo)
  changePassword: async (currentPassword, newPassword) => {
    return { success: true, message: 'Password changed successfully' };
  }
};