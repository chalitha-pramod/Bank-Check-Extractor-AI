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

// Axios instance configuration
export const createAxiosInstance = () => {
  const config = getApiConfig();
  
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
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return instance;
};

export default getApiConfig;
