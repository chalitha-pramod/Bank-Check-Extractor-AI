import axios from 'axios';

// API Configuration for different environments
const getApiConfig = () => {
  // Development environment
  if (process.env.NODE_ENV === 'development') {
    return {
      baseURL: 'http://localhost:5000',
      timeout: 10000,
      withCredentials: false
    };
  }
  
  // Production environment (Vercel, Netlify, etc.)
  return {
    baseURL: 'https://bank-check-extractor-ai-backend.vercel.app',
    timeout: 15000,
    withCredentials: false
  };
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: '/api/auth/profile',
  CHECKS: '/api/checks',
  TEST_DB: '/api/test-db',
  EXPORT_CSV: (id) => `/api/checks/${id}/export-csv`,
  EXPORT_PDF: (id) => `/api/checks/${id}/export-pdf`,
  DELETE_CHECK: (id) => `/api/checks/${id}`,
  INSERT_SAMPLE: '/api/checks/insert-sample'
};

// Axios instance configuration with error handling
export const createAxiosInstance = () => {
  try {
    const config = getApiConfig();
    
    // Ensure axios is available
    if (!axios || typeof axios.create !== 'function') {
      throw new Error('Axios is not properly imported');
    }
    
    const instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      withCredentials: config.withCredentials,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Request interceptor to add auth token
    instance.interceptors.request.use(
      (config) => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get token from localStorage:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor to handle common errors
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          try {
            localStorage.removeItem('token');
            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          } catch (localStorageError) {
            console.warn('Failed to clear localStorage:', localStorageError);
          }
        }
        return Promise.reject(error);
      }
    );
    
    return instance;
  } catch (error) {
    console.error('Failed to create axios instance:', error);
    
    // Fallback: create a basic instance with error handling
    const fallbackInstance = {
      get: () => Promise.reject(new Error('Axios instance not available')),
      post: () => Promise.reject(new Error('Axios instance not available')),
      put: () => Promise.reject(new Error('Axios instance not available')),
      delete: () => Promise.reject(new Error('Axios instance not available')),
      interceptors: {
        request: { use: () => {} },
        response: { use: () => {} }
      }
    };
    
    return fallbackInstance;
  }
};

// Alternative method using direct axios calls
export const createDirectAxiosCall = (endpoint, method = 'GET', data = null, options = {}) => {
  try {
    const config = getApiConfig();
    const url = `${config.baseURL}${endpoint}`;
    
    const requestConfig = {
      method: method.toLowerCase(),
      url,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    // Add auth token if available
    try {
      const token = localStorage.getItem('token');
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
    }
    
    // Add data for POST/PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
      requestConfig.data = data;
    }
    
    return axios(requestConfig);
  } catch (error) {
    console.error('Failed to create direct axios call:', error);
    return Promise.reject(error);
  }
};

export default getApiConfig;
