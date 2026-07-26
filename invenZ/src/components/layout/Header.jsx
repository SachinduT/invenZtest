// src/components/layout/Header.jsx - WITH NOTIFICATIONS & PROFILE CLICK
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
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Welcome to InvenZ!',
      message: 'Start managing your inventory efficiently.',
      time: 'Just now',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Product "Wireless Mouse" is running low (5 units left).',
      time: '2 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Order Delivered',
      message: 'Order #INV-2024-001 has been successfully delivered.',
      time: '5 hours ago',
      read: false
    }
  ]);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

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
    // You can add navigation logic based on notification type
    console.log('Notification clicked:', notification);
    // Close notification dropdown
    setShowNotifications(false);
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

  // Handle profile click - Navigate to settings
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileNavigation = (path) => {
    setShowProfileMenu(false);
    navigate(path);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

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
        {/* Brand */}
        <div className="header-brand-modern" onClick={() => navigate('/')}>
          <span className="brand-icon-modern">🌿</span>
          <span className="brand-name-modern">Inven<span>Z</span></span>
          <span className="brand-tagline-modern">Smart Inventory</span>
        </div>

        {/* Search */}
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

        {/* Actions */}
        <div className="header-actions-modern">
          {/* Notification Button */}
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className="notification-btn-modern"
              onClick={handleNotificationClick}
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
                          {getNotificationIcon(notification.type)}
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

          {isAuthenticated ? (
            // Logged In - Show User Profile
            <div className="user-profile-modern" ref={profileRef}>
              <div 
                className="profile-clickable"
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
            // Not Logged In - Show Login Button
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