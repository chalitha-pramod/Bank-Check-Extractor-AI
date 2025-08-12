// Fetch-based API utility as an alternative to axios
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://bank-check-extractor-ai-backend.vercel.app';

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

// Generic fetch function with error handling
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch (error) {
    console.warn('Failed to get token from localStorage:', error);
  }
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };
  
  // Add auth token if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Prepare fetch options
  const fetchOptions = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle HTTP errors
    if (!response.ok) {
      // Handle 401 specifically
      if (response.status === 401) {
        try {
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }
      
      // Try to parse error response
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (parseError) {
        // If can't parse JSON, use text
        try {
          errorData = { message: await response.text() };
        } catch (textError) {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
      }
      
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      };
      throw error;
    }
    
    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
    
  } catch (error) {
    // If it's already an HTTP error, re-throw it
    if (error.response) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
};

// API methods
export const fetchApi = {
  // GET request
  get: (endpoint, options = {}) => {
    return apiFetch(endpoint, { ...options, method: 'GET' });
  },
  
  // POST request
  post: (endpoint, data = null, options = {}) => {
    return apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  // PUT request
  put: (endpoint, data = null, options = {}) => {
    return apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  },
  
  // DELETE request
  delete: (endpoint, options = {}) => {
    return apiFetch(endpoint, { ...options, method: 'DELETE' });
  },
  
  // Custom request
  request: (endpoint, options = {}) => {
    return apiFetch(endpoint, options);
  }
};

// Test function
export const testFetchApi = async () => {
  try {
    console.log('🧪 Testing fetch-based API...');
    const result = await fetchApi.get(API_ENDPOINTS.TEST_DB);
    console.log('✅ Fetch API test successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Fetch API test failed:', error);
    throw error;
  }
};

export default fetchApi;
