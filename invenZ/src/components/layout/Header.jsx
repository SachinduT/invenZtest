// src/components/layout/Header.jsx - WITH NOTIFICATIONS & PROFILE CLICK
import React, { useState, useRef, useEffect } from 'react';
// src/components/layout/Header.jsx - COMPLETE WITH NOTIFICATIONS & USER DROPDOWN
import React, { useState } from 'react';
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
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ✅ Notifications Data
  const notifications = [
    { 
      id: 1, 
      icon: '📦', 
      message: 'New product added: Premium Rice', 
      time: '5 min ago', 
      read: false,
      path: '/products'
    },
    { 
      id: 2, 
      icon: '⚠️', 
      message: 'Low stock alert: Sugar (8 left)', 
      time: '1 hour ago', 
      read: false,
      path: '/stock'
    },
    { 
      id: 3, 
      icon: '📊', 
      message: 'Monthly report is ready', 
      time: '2 hours ago', 
      read: false,
      path: '/reports'
    },
    { 
      id: 4, 
      icon: '✅', 
      message: 'Order #PO-2026-001 delivered', 
      time: '1 day ago', 
      read: true,
      path: '/orders'
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

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
  const handleNotificationClick = (notification) => {
    // Mark as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    console.log('Notification clicked:', notification.message);
    
    // Close dropdown
    setShowNotifications(false);
    
    // Navigate to the path
    if (notification.path) {
      navigate(notification.path);
    }
  };

  const markAllAsRead = () => {
    notifications.forEach(n => n.read = true);
    console.log('All notifications marked as read');
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
          {/* Notification Button */}
          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className="notification-btn-modern"
              onClick={handleNotificationClick}
          
          {/* ===== NOTIFICATIONS ===== */}
          <div className="notification-wrapper">
            <button 
              className="notification-btn-modern"
              onClick={() => setShowNotifications(!showNotifications)}
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

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button className="mark-all-btn" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="dropdown-body">
                  {notifications.length === 0 ? (
                    <div className="empty-notifications">
                      <span>🔕</span>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <span className="notif-icon">{notif.icon}</span>
                        <div className="notif-content">
                          <p className="notif-message">{notif.message}</p>
                          <span className="notif-time">{notif.time}</span>
                        </div>
                        {!notif.read && <span className="notif-dot"></span>}
                        <span className="notif-arrow">→</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="dropdown-footer">
                  <button 
                    className="view-all-btn"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== USER PROFILE / LOGIN ===== */}
          {isAuthenticated ? (
            // Logged In - Show User Profile
            <div className="user-profile-modern" ref={profileRef}>
              <div 
                className="profile-clickable"
                onClick={handleProfileClick}
            <div className="user-profile-wrapper">
              <div 
                className="user-profile-modern"
                onClick={() => setShowUserMenu(!showUserMenu)}
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
              {/* ✅ User Dropdown - Profile, Settings, Logout */}
              {showUserMenu && (
                <div className="user-dropdown">
                  <button onClick={() => navigate('/settings/profile')}>
                    <span>👤</span> Profile
                  </button>
                  <button onClick={() => navigate('/settings')}>
                    <span>⚙️</span> Settings
                  </button>
                  <hr />
                  <button onClick={handleLogout} className="logout-btn">
                    <span>🚪</span> Logout
                  </button>
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