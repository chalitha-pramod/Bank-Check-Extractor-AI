import axios from 'axios';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend health...');
    const response = await axios.get('https://bank-check-extractor-ai-backend.vercel.app/api/health');
    console.log('✅ Backend health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    return false;
  }
};

export const testAuthEndpoint = async () => {
  try {
    console.log('Testing authentication...');
    const response = await axios.get('https://bank-check-extractor-ai-backend.vercel.app/api/auth/test');
    console.log('✅ Authentication test passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
};
