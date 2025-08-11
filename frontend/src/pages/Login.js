import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import logo from '../assets/logo.svg';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await axios.post('/api/auth/login', formData);
      onLogin(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setErrors({ password: 'Invalid username or password' });
      } else if (error.response?.status === 404) {
        setErrors({ username: 'User not found' });
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
              Welcome Back
            </h2>
          </div>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Sign in to your Bank Check AI account
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              autoComplete="current-password"
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
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <p style={{ margin: 0, color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#667eea', fontWeight: '600' }}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 