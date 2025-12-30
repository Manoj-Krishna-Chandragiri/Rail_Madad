import axios from 'axios';

// Debug environment variables
console.log('🔧 Environment Debug:');
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('All env vars:', import.meta.env);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

console.log('🚀 Final API_BASE_URL:', API_BASE_URL);

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const url = (config.baseURL || '') + (config.url || '');
    console.log('📡 Making request to:', url);
    
    const token = localStorage.getItem('authToken');
    console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 30)}...` : 'NOT FOUND');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set');
    } else {
      console.warn('⚠️ No authToken in localStorage!');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ Response received from:', response.config.url);
    }
    return response;
  },
  (error) => {
    // Only log detailed errors in development
    if (import.meta.env.DEV) {
      console.error('❌ Response error:', error.message);
      console.error('❌ URL that failed:', error.config?.url);
    }
    
    // Handle specific error cases
    if (error.code === 'ERR_NETWORK') {
      console.warn('Network connection issue - backend may be offline');
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('Request timeout - please check your connection and try again');
      error.message = 'Request timeout. Please check your connection and try again.';
    } else if (error.response?.status === 401) {
      console.warn('Authentication failed - status 401');
      // Don't auto-redirect if we just logged in (give a grace period)
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        // No token at all - redirect
        window.location.href = '/login-portal';
      }
      // If we have a token but got 401, let the calling code handle it
    } else if (error.response?.status >= 500) {
      console.warn('Server error occurred - please try again later');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };