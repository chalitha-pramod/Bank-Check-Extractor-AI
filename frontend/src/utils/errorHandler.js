// Error handling utility for better user experience
export const handleApiError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  let errorMessage = 'An unexpected error occurred. Please try again.';
  let fieldError = {};
  let shouldRedirect = false;
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        errorMessage = data.message || 'Invalid data provided. Please check your input.';
        if (data.errors) {
          // Handle validation errors
          Object.keys(data.errors).forEach(field => {
            fieldError[field] = data.errors[field];
          });
        }
        break;
        
      case 401:
        errorMessage = 'Authentication failed. Please log in again.';
        shouldRedirect = true;
        break;
        
      case 403:
        errorMessage = 'Access denied. You do not have permission to perform this action.';
        break;
        
      case 404:
        errorMessage = data.message || 'Resource not found.';
        break;
        
      case 409:
        errorMessage = data.message || 'Resource already exists.';
        if (data.message?.includes('username')) {
          fieldError.username = 'Username already exists';
        } else if (data.message?.includes('email')) {
          fieldError.email = 'Email already exists';
        }
        break;
        
      case 422:
        errorMessage = data.message || 'Validation failed. Please check your input.';
        if (data.errors) {
          Object.keys(data.errors).forEach(field => {
            fieldError[field] = data.errors[field];
          });
        }
        break;
        
      case 429:
        errorMessage = 'Too many requests. Please wait a moment and try again.';
        break;
        
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
        
      case 502:
      case 503:
      case 504:
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        break;
        
      default:
        errorMessage = data.message || `Error ${status}: Please try again.`;
    }
  } else if (error.request) {
    // Request made but no response received
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else {
      errorMessage = 'No response from server. Please check your connection and try again.';
    }
  } else {
    // Other errors (parsing, etc.)
    if (error.message.includes('JSON')) {
      errorMessage = 'Invalid response from server. Please try again.';
    } else {
      errorMessage = error.message || 'An unexpected error occurred.';
    }
  }
  
  return {
    message: errorMessage,
    fieldError,
    shouldRedirect,
    status: error.response?.status,
    code: error.code
  };
};

// Handle authentication errors specifically
export const handleAuthError = (error) => {
  const result = handleApiError(error, 'authentication');
  
  if (result.shouldRedirect) {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
  
  return result;
};

// Handle network errors
export const handleNetworkError = (error) => {
  if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
    return {
      message: 'Network error. Please check your internet connection and try again.',
      fieldError: {},
      shouldRedirect: false,
      isNetworkError: true
    };
  }
  
  return handleApiError(error, 'network');
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries}`);
    }
  }
};

// Check if error is retryable
export const isRetryableError = (error) => {
  if (error.response) {
    // Don't retry client errors (4xx) except 429 (rate limit)
    if (error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
      return false;
    }
    // Retry server errors (5xx)
    return error.response.status >= 500;
  }
  
  // Retry network errors
  return error.code === 'NETWORK_ERROR' || 
         error.message.includes('Network Error') ||
         error.code === 'ECONNABORTED';
};
