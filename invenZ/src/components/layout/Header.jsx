// src/components/layout/Header.jsx - COMPLETE WITH NOTIFICATIONS & USER DROPDOWN
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Notifications Data
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      icon: '📦', 
      title: 'New Product Added',
      message: 'New product added: Premium Rice', 
      time: '5 min ago', 
      read: false,
      type: 'info',
      path: '/products'
    },
    { 
      id: 2, 
      icon: '⚠️', 
      title: 'Low Stock Alert',
      message: 'Low stock alert: Sugar (8 left)', 
      time: '1 hour ago', 
      read: false,
      type: 'warning',
      path: '/stock'
    },
    { 
      id: 3, 
      icon: '📊', 
      title: 'Report Ready',
      message: 'Monthly report is ready', 
      time: '2 hours ago', 
      read: false,
      type: 'success',
      path: '/reports'
    },
    { 
      id: 4, 
      icon: '✅', 
      title: 'Order Delivered',
      message: 'Order #PO-2026-001 delivered', 
      time: '1 day ago', 
      read: true,
      type: 'success',
      path: '/orders'
    },
  ]);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle notification click
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Mark all as read when opened
    if (!showNotifications) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  // Handle notification item click
  const handleNotificationItemClick = (notification) => {
    console.log('Notification clicked:', notification);
    setShowNotifications(false);
    if (notification.path) {
      navigate(notification.path);
    }
  };

  // Mark single notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Handle profile click
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileNavigation = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <header className="header-modern">
      <div className="header-container-modern">
        {/* ========== BRAND ========== */}
        <div className="header-brand-modern" onClick={() => navigate('/')}>
          <span className="brand-icon-modern">🌿</span>
          <span className="brand-name-modern">Inven<span>Z</span></span>
          <span className="brand-tagline-modern">Smart Inventory</span>
        </div>

        {/* ========== SEARCH ========== */}
        <form className="header-search-modern" onSubmit={handleSearch}>
          <span className="search-icon-modern">🔍</span>
          <input
            type="text"
            placeholder="Search products, suppliers..."
            className="search-input-modern"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn-modern">Search</button>
        </form>

        {/* ========== ACTIONS ========== */}
        <div className="header-actions-modern">
          {/* ===== NOTIFICATIONS ===== */}
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className="notification-btn-modern"
              onClick={handleNotificationClick}
              aria-label="Notifications"
            >
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <span className="notification-title">Notifications</span>
                  {notifications.length > 0 && (
                    <button 
                      className="clear-all-btn"
                      onClick={clearAllNotifications}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationItemClick(notification)}
                      >
                        <div className="notification-icon-wrapper">
                          {notification.icon || getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-item-title">
                            {notification.title}
                            {!notification.read && (
                              <span className="unread-dot">●</span>
                            )}
                          </div>
                          <div className="notification-item-message">
                            {notification.message}
                          </div>
                          <div className="notification-item-time">
                            {notification.time}
                          </div>
                        </div>
                        {!notification.read && (
                          <button 
                            className="mark-read-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-notifications">
                    <span className="no-notif-icon">🔕</span>
                    <p>No notifications</p>
                    <small>You're all caught up!</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===== USER PROFILE / LOGIN ===== */}
          {isAuthenticated ? (
            <div className="user-profile-wrapper" ref={profileRef}>
              <div 
                className="user-profile-modern"
                onClick={handleProfileClick}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=1B5E20&color=fff&bold=true&size=40`}
                  alt="User"
                  className="user-avatar-modern"
                />
                <div className="user-info-modern">
                  <span className="user-name-modern">{user?.name || 'Admin'}</span>
                  <span className="user-role-modern">{user?.role || 'Administrator'}</span>
                </div>
                <span className="dropdown-arrow">▼</span>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=1B5E20&color=fff&bold=true&size=60`}
                      alt="User"
                      className="profile-dropdown-avatar"
                    />
                    <div className="profile-dropdown-info">
                      <div className="profile-dropdown-name">{user?.name || 'Admin'}</div>
                      <div className="profile-dropdown-email">{user?.email || 'admin@invenz.com'}</div>
                      <span className="profile-dropdown-role">{user?.role || 'Administrator'}</span>
                    </div>
                  </div>

                  <div className="profile-dropdown-menu">
                    <button 
                      className="profile-menu-item"
                      onClick={() => handleProfileNavigation('/settings')}
                    >
                      <span className="menu-icon">⚙️</span>
                      Settings
                      <span className="menu-shortcut">⌘S</span>
                    </button>

                    <button 
                      className="profile-menu-item"
                      onClick={() => handleProfileNavigation('/profile')}
                    >
                      <span className="menu-icon">👤</span>
                      My Profile
                    </button>

                    <button 
                      className="profile-menu-item"
                      onClick={() => handleProfileNavigation('/reports')}
                    >
                      <span className="menu-icon">📊</span>
                      Reports
                    </button>

                    <button 
                      className="profile-menu-item"
                      onClick={() => handleProfileNavigation('/orders')}
                    >
                      <span className="menu-icon">📦</span>
                      My Orders
                    </button>

                    <div className="profile-dropdown-divider"></div>

                    <button 
                      className="profile-menu-item logout-item"
                      onClick={handleLogout}
                    >
                      <span className="menu-icon">🚪</span>
                      Logout
                      <span className="menu-shortcut">⌘Q</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="login-btn-modern" 
              onClick={() => navigate('/login')}
            >
              🔐 Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;