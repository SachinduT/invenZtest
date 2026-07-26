// src/pages/Login.jsx - WITH ATTRACTIVE ERROR MESSAGES & DEMO USERS
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  
  const { login, users } = useAuth();  // ✅ users comes from AuthContext
  const { error: showError, success } = useNotification();
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate password
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    if (field === 'email' && email && !validateEmail(email)) {
      setFieldErrors({ ...fieldErrors, email: 'Please enter a valid email address' });
    } else if (field === 'email' && email && validateEmail(email)) {
      setFieldErrors({ ...fieldErrors, email: '' });
    }

    if (field === 'password' && password && !validatePassword(password)) {
      setFieldErrors({ ...fieldErrors, password: 'Password must be at least 6 characters' });
    } else if (field === 'password' && password && validatePassword(password)) {
      setFieldErrors({ ...fieldErrors, password: '' });
    }
  };

  const handleChange = (e, field) => {
    const value = e.target.value;
    if (field === 'email') {
      setEmail(value);
      if (touched.email) {
        if (value && !validateEmail(value)) {
          setFieldErrors({ ...fieldErrors, email: 'Please enter a valid email address' });
        } else {
          setFieldErrors({ ...fieldErrors, email: '' });
        }
      }
    } else if (field === 'password') {
      setPassword(value);
      if (touched.password) {
        if (value && !validatePassword(value)) {
          setFieldErrors({ ...fieldErrors, password: 'Password must be at least 6 characters' });
        } else {
          setFieldErrors({ ...fieldErrors, password: '' });
        }
      }
    }
  };

  // Get user-friendly error messages
  const getErrorMessage = (error) => {
    const errorMap = {
      'auth/user-not-found': '❌ No account found with this email address. Please check or create a new account.',
      'auth/wrong-password': '🔑 Incorrect password. Please try again or click "Forgot Password".',
      'auth/invalid-email': '📧 Invalid email format. Please enter a valid email address.',
      'auth/too-many-requests': '⏳ Too many failed attempts. Please wait a moment and try again.',
      'auth/network-request-failed': '🌐 Network error. Please check your internet connection.',
      'auth/user-disabled': '🚫 This account has been disabled. Please contact support.',
      'auth/email-already-in-use': '📧 This email is already registered. Please login instead.',
      'auth/weak-password': '🔒 Password should be at least 6 characters long.',
      'auth/invalid-credential': '❌ Invalid credentials. Please check your email and password.'
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (error.includes(key)) {
        return value;
      }
    }
    return `❌ ${error || 'Login failed. Please try again.'}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ email: true, password: true });
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);
      success(response.message || 'Login successful! 🎉');
      navigate('/');
    } catch (err) {
      const errorMessage = getErrorMessage(err.message);
      showError(errorMessage);
      
      if (err.message.includes('email') || err.message.includes('user')) {
        setFieldErrors({ ...fieldErrors, email: errorMessage });
      } else if (err.message.includes('password')) {
        setFieldErrors({ ...fieldErrors, password: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setShowDemoUsers(false);
    
    // Auto submit after filling
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }, 500);
  };

  const hasError = (field) => {
    return fieldErrors[field] && touched[field];
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="brand">
          <span className="brand-icon">🌿</span>
          <h1>Inven<span>Z</span></h1>
          <p>Smart Inventory Management</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group ${hasError('email') ? 'has-error' : ''}`}>
            <label>
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange(e, 'email')}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className={hasError('email') ? 'error' : ''}
            />
            {hasError('email') && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                {fieldErrors.email}
              </div>
            )}
            {touched.email && !fieldErrors.email && email && (
              <div className="field-success">
                <span className="success-icon">✅</span>
                Valid email address
              </div>
            )}
          </div>

          <div className={`form-group ${hasError('password') ? 'has-error' : ''}`}>
            <label>
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleChange(e, 'password')}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              required
              disabled={loading}
              className={hasError('password') ? 'error' : ''}
            />
            {hasError('password') && (
              <div className="field-error">
                <span className="error-icon">⚠️</span>
                {fieldErrors.password}
              </div>
            )}
            {touched.password && !fieldErrors.password && password && (
              <div className="field-success">
                <span className="success-icon">✅</span>
                Valid password
              </div>
            )}
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-link">
              🔑 Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Logging in...
              </>
            ) : (
              '🚀 Login'
            )}
          </button>
        </form>

        {/* ✅ DEMO USERS SECTION */}
        <div className="demo-section">
          <button 
            type="button"
            className={`demo-toggle ${showDemoUsers ? 'active' : ''}`}
            onClick={() => setShowDemoUsers(!showDemoUsers)}
          >
            <span className="demo-toggle-icon">👥</span>
            {showDemoUsers ? 'Hide Demo Users' : 'Show Demo Users'}
            <span className="demo-toggle-arrow">{showDemoUsers ? '▲' : '▼'}</span>
          </button>
          
          {showDemoUsers && users && users.length > 0 && (
            <div className="demo-users-container">
              <div className="demo-header">
                <span className="demo-header-icon">🔑</span>
                <span className="demo-header-text">Quick Login with Demo Accounts</span>
              </div>
              <p className="demo-subtitle">Click any user to auto-login instantly</p>
              
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="demo-user-card"
                  onClick={() => fillCredentials(user.email, user.password)}
                >
                  <div className="demo-user-avatar">
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1B5E20&color=fff&bold=true&size=40`} 
                      alt={user.name}
                    />
                  </div>
                  <div className="demo-user-info">
                    <span className="demo-user-name">{user.name}</span>
                    <span className="demo-user-email">{user.email}</span>
                    <span className={`demo-user-role ${(user.role || 'staff').toLowerCase()}`}>
                      {user.role || 'Staff'}
                    </span>
                  </div>
                  <div className="demo-user-action">
                    <span className="demo-user-password">🔑 {user.password}</span>
                    <span className="demo-user-click">Click to Login →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="footer-links">
          <p>
            Don't have an account? <Link to="/register">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;