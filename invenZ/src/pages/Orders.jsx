// src/pages/Login.jsx - WITH FIREBASE AUTHENTICATION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const { login, currentUser } = useAuth();
  const { error: showError, success } = useNotification();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      const response = await login(email, password);
      success(response.message || 'Login successful!');
      navigate('/');
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo users (these should be created in Firebase first)
  const demoUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@invenz.com',
      password: 'Admin@123',
      role: 'Admin'
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@invenz.com',
      password: 'Manager@123',
      role: 'Manager'
    },
    {
      id: '3',
      name: 'Staff User',
      email: 'staff@invenz.com',
      password: 'Staff@123',
      role: 'Staff'
    }
  ];

  const fillCredentials = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="login-page">
      <div className="card">
        <div className="brand">
          <span className="brand-icon">🌿</span>
          <h1>Inven<span>Z</span></h1>
          <p>Smart Inventory Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Users - Quick Login */}
        <div className="demo-users">
          <button 
            type="button"
            className="demo-toggle"
            onClick={() => setShowDemoUsers(!showDemoUsers)}
          >
            {showDemoUsers ? 'Hide Demo Users' : 'Show Demo Users'}
          </button>
          
          {showDemoUsers && (
            <div className="demo-users-list">
              {demoUsers.map((user) => (
                <div 
                  key={user.id}
                  className="demo-user-item"
                  onClick={() => fillCredentials(user.email, user.password)}
                >
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1B5E20&color=fff&bold=true&size=40`} 
                    alt={user.name} 
                  />
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                    <span className={`user-role ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </div>
                  <span className="user-badge">Click to Login</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="footer-links">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;