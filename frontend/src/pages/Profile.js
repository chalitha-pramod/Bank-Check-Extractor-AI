import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../assets/logo.svg';

const Profile = ({ user }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalChecks: 0,
    lastLogin: '',
    memberSince: ''
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('https://bank-check-extractor-ai-backend.vercel.app/api/user/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put('https://bank-check-extractor-ai-backend.vercel.app/api/user/profile', {
        username: formData.username,
        email: formData.email
      });
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await axios.put('https://bank-check-extractor-ai-backend.vercel.app/api/user/password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      toast.success('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-message">Profile Settings</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Profile Information */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
            <img src={logo} alt="Bank Check AI Logo" style={{ width: '24px', height: '24px' }} />
            <h3 style={{ color: '#333', margin: 0 }}>Profile Information</h3>
          </div>
          
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter your email"
              />
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: '0' }}></div>
                  Updating Profile...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
            <img src={logo} alt="Bank Check AI Logo" style={{ width: '24px', height: '24px' }} />
            <h3 style={{ color: '#333', margin: 0 }}>Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="current_password">Current Password</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password">New Password</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirm New Password</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Confirm new password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: '0' }}></div>
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <img src={logo} alt="Bank Check AI Logo" style={{ width: '24px', height: '24px' }} />
          <h3 style={{ color: '#333', margin: 0 }}>Account Statistics</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '0.5rem' }}>
              {stats.totalChecks}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Checks Extracted</div>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'rgba(40, 167, 69, 0.1)', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
              {stats.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : 'N/A'}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Last Login</div>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'rgba(23, 162, 184, 0.1)', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8', marginBottom: '0.5rem' }}>
              {stats.memberSince ? new Date(stats.memberSince).toLocaleDateString() : 'N/A'}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Member Since</div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <img src={logo} alt="Bank Check AI Logo" style={{ width: '24px', height: '24px' }} />
          <h3 style={{ color: '#333', margin: 0 }}>Account Actions</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                // Handle account deletion
                toast.info('Account deletion feature coming soon');
              }
            }}
          >
            Delete Account
          </button>
          
          <button 
            className="btn btn-info"
            onClick={() => {
              toast.info('Export feature coming soon');
            }}
          >
            Export My Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 