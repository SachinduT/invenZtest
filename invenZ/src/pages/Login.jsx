// src/pages/Login.jsx - WITH ATTRACTIVE ERROR MESSAGES
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
  const { login } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
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
      // Handle specific Firebase/auth errors with attractive messages
      const errorMessage = getErrorMessage(err.message);
      showError(errorMessage);
      
      // Set field-specific errors
      if (err.message.includes('email') || err.message.includes('user')) {
        setFieldErrors({ ...fieldErrors, email: errorMessage });
      } else if (err.message.includes('password')) {
        setFieldErrors({ ...fieldErrors, password: errorMessage });
      }
    } finally {
      setLoading(false);
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
      'auth/invalid-credential': '❌ Invalid credentials. Please check your email and password.',
      'auth/operation-not-allowed': '⚠️ This login method is not enabled. Please contact support.',
      'auth/requires-recent-login': '⏰ Please login again to continue.',
      'auth/provider-already-linked': '🔗 This account is already linked with another provider.',
      'auth/invalid-verification-code': '❌ Invalid verification code. Please try again.',
      'auth/invalid-verification-id': '❌ Invalid verification ID. Please try again.'
    };

    // Check if error matches any known Firebase error
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.includes(key)) {
        return value;
      }
    }

    // Fallback error message
    return `❌ ${error || 'Login failed. Please try again.'}`;
  };

  // Check if field has error
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
          {/* Email Field */}
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

          {/* Password Field */}
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

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
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