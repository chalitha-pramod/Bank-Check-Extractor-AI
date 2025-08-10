import axios from 'axios';

export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    console.log('📍 Backend URL:', process.env.REACT_APP_API_BASE_URL);
    console.log('📍 Axios baseURL:', axios.defaults.baseURL);
    
    const response = await axios.get('/api/health');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.error('📍 Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    return { success: false, error: error.message };
  }
};

export const testAuthEndpoint = async () => {
  try {
    console.log('🔍 Testing auth endpoint...');
    const response = await axios.get('/api/auth/test');
    console.log('✅ Auth endpoint test successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Auth endpoint test failed:', error);
    return { success: false, error: error.message };
  }
};
