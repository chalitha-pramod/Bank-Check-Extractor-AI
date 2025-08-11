import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../assets/logo.svg';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Handle mobile viewport height issues
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post('https://bank-check-extractor-ai-backend.vercel.app/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password
      });
      
      // Show success message and redirect to login
      toast.success(response.data.message);
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        if (error.response.data.message.includes('username')) {
          setErrors({ username: 'Username already exists' });
        } else if (error.response.data.message.includes('email')) {
          setErrors({ email: 'Email already exists' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1rem' }}>
            <img src={logo} alt="Bank Check AI Logo" style={{ width: '32px', height: '32px' }} />
            <h2 style={{ color: '#333', margin: 0 }}>
              Create Account
            </h2>
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Join Bank Check AI and start extracting check information
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              placeholder="Choose a username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={{
                borderColor: errors.username ? '#dc3545' : '#e9ecef'
              }}
            />
            {errors.username && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: '12px', 
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>⚠️</span>
                {errors.username}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              placeholder="Enter your email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={{
                borderColor: errors.email ? '#dc3545' : '#e9ecef'
              }}
            />
            {errors.email && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: '12px', 
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>⚠️</span>
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              placeholder="Create a password (min 6 characters)"
              autoComplete="new-password"
              style={{
                borderColor: errors.password ? '#dc3545' : '#e9ecef'
              }}
            />
            {errors.password && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: '12px', 
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>⚠️</span>
                {errors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              placeholder="Confirm your password"
              autoComplete="new-password"
              style={{
                borderColor: errors.confirm_password ? '#dc3545' : '#e9ecef'
              }}
            />
            {errors.confirm_password && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: '12px', 
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>⚠️</span>
                {errors.confirm_password}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
            onTouchStart={() => {}} // Prevent double-tap zoom on mobile
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: '0' }}></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <p style={{ margin: 0, color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#667eea', fontWeight: '600' }}>
              Sign in here
            </Link>
          </p>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(40, 167, 69, 0.1)', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#28a745' }}>
            <strong>Free to use!</strong><br />
            No credit card required. Start extracting check information instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 