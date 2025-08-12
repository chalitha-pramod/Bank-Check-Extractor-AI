import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createAxiosInstance, createDirectAxiosCall, API_ENDPOINTS } from '../utils/apiConfig';
import { debugApiConfig, testApiEndpoints, getAvailableHttpClients } from '../utils/debugApi';
import fetchApi from '../utils/fetchApi';
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
      // Try the main axios instance first
      let response;
      try {
        const api = createAxiosInstance();
        response = await api.post(API_ENDPOINTS.LOGIN, formData);
      } catch (axiosError) {
        console.warn('Main axios instance failed, trying direct call:', axiosError);
        try {
          // Fallback to direct axios call
          response = await createDirectAxiosCall(API_ENDPOINTS.LOGIN, 'POST', formData);
        } catch (directAxiosError) {
          console.warn('Direct axios call failed, trying fetch API:', directAxiosError);
          // Final fallback to fetch API
          response = await fetchApi.post(API_ENDPOINTS.LOGIN, formData);
        }
      }
      
      onLogin(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      let fieldError = {};
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            errorMessage = data.message || 'Invalid username or password';
            fieldError = { password: 'Invalid username or password' };
            break;
          case 404:
            errorMessage = data.message || 'User not found';
            fieldError = { username: 'User not found' };
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          case 0:
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = data.message || `Error ${status}: Please try again.`;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Other errors
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      toast.error(errorMessage);
      setErrors(fieldError);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Debug function to help troubleshoot API issues
  const handleDebug = async () => {
    console.log('🔍 Starting API debug...');
    
    // Debug API configuration
    debugApiConfig();
    
    // Check available HTTP clients
    const clients = getAvailableHttpClients();
    console.log('Available HTTP clients:', clients);
    
    // Test API endpoints
    try {
      const result = await testApiEndpoints();
      console.log('API test result:', result);
      
      if (result.success) {
        toast.info(`API test successful using ${result.method}`);
      } else {
        toast.error('API test failed');
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error('API test error: ' + error.message);
    }
    
    // Test fetch API as well
    try {
      console.log('🧪 Testing fetch API...');
      const fetchResult = await fetchApi.get('/api/test-db');
      console.log('✅ Fetch API test successful:', fetchResult);
      toast.info('Fetch API test successful');
    } catch (fetchError) {
      console.error('❌ Fetch API test failed:', fetchError);
      toast.error('Fetch API test failed: ' + fetchError.message);
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

          {/* Debug button for troubleshooting */}
          <button 
            type="button" 
            onClick={handleDebug}
            style={{ 
              width: '100%', 
              marginTop: '0.5rem',
              padding: '0.5rem',
              fontSize: '12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              color: '#6c757d',
              cursor: 'pointer'
            }}
          >
            🐛 Debug API (Check Console)
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