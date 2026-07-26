// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuth();
  const { success, error } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({ name: formData.name });
      success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      error('New passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await changePassword(passwordData.current, passwordData.new);
      success('Password changed successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      'Administrator': { color: '#1B5E20', bg: '#E8F5E9' },
      'Manager': { color: '#FF9800', bg: '#FFF3E0' },
      'Staff': { color: '#2196F3', bg: '#E3F2FD' }
    };
    return roles[role] || roles['Staff'];
  };

  const roleStyle = getRoleBadge(formData.role);

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>

      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <img
              src={`https://ui-avatars.com/api/?name=${formData.name || 'User'}&background=1B5E20&color=fff&bold=true&size=120`}
              alt={formData.name}
              className="profile-avatar"
            />
            <div className="profile-status online">
              <span className="status-dot"></span>
              <span className="status-text">Active</span>
            </div>
          </div>
          <div className="profile-info">
            <h1>{formData.name || 'User'}</h1>
            <p className="profile-email">{formData.email}</p>
            <span className="profile-role" style={{ 
              background: roleStyle.bg, 
              color: roleStyle.color 
            }}>
              {formData.role || 'Staff'}
            </span>
            <div className="profile-actions">
              <button 
                className="btn-edit-profile"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">24</span>
            <span className="stat-label">Products Added</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Orders Processed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Accuracy Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">30d</span>
            <span className="stat-label">Active Days</span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Edit Profile Form */}
          {isEditing && (
            <div className="profile-card">
              <h3>✏️ Edit Profile</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="disabled"
                  />
                  <small>Email cannot be changed</small>
                </div>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Change Password */}
          <div className="profile-card">
            <h3>🔐 Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  required
                  minLength="6"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Account Info */}
          <div className="profile-card">
            <h3>👤 Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>User ID</label>
                <span>#{user?.id || '001'}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <span>{formData.role || 'Staff'}</span>
              </div>
              <div className="info-item">
                <label>Joined</label>
                <span>January 2026</span>
              </div>
              <div className="info-item">
                <label>Last Login</label>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;