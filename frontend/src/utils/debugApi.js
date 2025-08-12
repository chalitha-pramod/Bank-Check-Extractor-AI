// Debug utility for API configuration issues
export const debugApiConfig = () => {
  console.log('🔍 Debugging API Configuration...');
  
  // Check environment
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Environment variables:', {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    REACT_APP_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT
  });
  
  // Check axios availability
  try {
    const axios = require('axios');
    console.log('✅ Axios available via require:', typeof axios);
    console.log('✅ Axios.create available:', typeof axios.create);
  } catch (error) {
    console.error('❌ Axios not available via require:', error);
  }
  
  // Check import availability
  try {
    import('axios').then(axios => {
      console.log('✅ Axios available via dynamic import:', typeof axios.default);
      console.log('✅ Axios.create available via dynamic import:', typeof axios.default.create);
    }).catch(error => {
      console.error('❌ Axios not available via dynamic import:', error);
    });
  } catch (error) {
    console.error('❌ Dynamic import failed:', error);
  }
  
  // Check localStorage
  try {
    const token = localStorage.getItem('token');
    console.log('✅ LocalStorage available, token exists:', !!token);
  } catch (error) {
    console.error('❌ LocalStorage not available:', error);
  }
  
  // Check window object
  console.log('✅ Window object available:', typeof window !== 'undefined');
  console.log('✅ Document object available:', typeof document !== 'undefined');
  
  // Check current location
  if (typeof window !== 'undefined') {
    console.log('Current location:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
  }
};

// Test API endpoints directly
export const testApiEndpoints = async () => {
  console.log('🧪 Testing API endpoints directly...');
  
  try {
    // Test with fetch first
    const testUrl = 'https://bank-check-extractor-ai-backend.vercel.app/api/test-db';
    console.log('Testing with fetch:', testUrl);
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('✅ Fetch test successful:', {
      status: response.status,
      data: data
    });
    
    return { success: true, method: 'fetch', data };
  } catch (error) {
    console.error('❌ Fetch test failed:', error);
    
    // Try with XMLHttpRequest as fallback
    try {
      console.log('Trying XMLHttpRequest...');
      const xhr = new XMLHttpRequest();
      const testUrl = 'https://bank-check-extractor-ai-backend.vercel.app/api/test-db';
      
      return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                console.log('✅ XMLHttpRequest test successful:', {
                  status: xhr.status,
                  data: data
                });
                resolve({ success: true, method: 'xmlhttprequest', data });
              } catch (parseError) {
                console.error('❌ XMLHttpRequest parse failed:', parseError);
                reject(parseError);
              }
            } else {
              console.error('❌ XMLHttpRequest failed:', xhr.status, xhr.statusText);
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          }
        };
        
        xhr.onerror = function() {
          console.error('❌ XMLHttpRequest error');
          reject(new Error('XMLHttpRequest error'));
        };
        
        xhr.open('GET', testUrl);
        xhr.send();
      });
    } catch (xhrError) {
      console.error('❌ XMLHttpRequest not available:', xhrError);
      return { success: false, method: 'none', error: xhrError };
    }
  }
};

// Check if we're in a browser environment
export const isBrowserEnvironment = () => {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof navigator !== 'undefined';
};

// Check if we're in a production build
export const isProductionBuild = () => {
  return process.env.NODE_ENV === 'production';
};

// Get available HTTP clients
export const getAvailableHttpClients = () => {
  const clients = [];
  
  if (typeof fetch !== 'undefined') {
    clients.push('fetch');
  }
  
  if (typeof XMLHttpRequest !== 'undefined') {
    clients.push('XMLHttpRequest');
  }
  
  try {
    const axios = require('axios');
    if (axios && typeof axios.create === 'function') {
      clients.push('axios (require)');
    }
  } catch (error) {
    // Axios not available via require
  }
  
  return clients;
};
