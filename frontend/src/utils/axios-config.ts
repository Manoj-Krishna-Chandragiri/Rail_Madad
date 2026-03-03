import axios from 'axios';
import { getValidToken } from './firebase-auth';

// Environment detection and API URL configuration
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Determine API base URL
// Empty string = relative paths → Vite proxy forwards to http://127.0.0.1:8000
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Override for local development if needed
if (isDevelopment && isLocalhost && API_BASE_URL && !API_BASE_URL.includes('localhost')) {
  // If we're in development but API_BASE_URL is pointing to production, 
  // and we want to use local backend, we can override it
  const useLocalBackend = import.meta.env.VITE_USE_LOCAL_BACKEND === 'true';
  if (useLocalBackend) {
    API_BASE_URL = 'http://localhost:8001';
  }
}

// Only log detailed configuration in development
if (import.meta.env.DEV) {
  console.log('🚀 API Configuration:', {
    isDevelopment,
    isLocalhost,
    API_BASE_URL,
    environment: import.meta.env.MODE
  });
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for slow connections
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add fresh token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors (like SSL issues in development)
    if (!error.response && isDevelopment) {
      console.error('Network error in development:', error.message);
      
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.warn('Request timeout in development mode. Server may be slow to respond.');
        error.message = 'Request timeout. The server is taking too long to respond.';
      }
      
      // If we're hitting SSL issues with HTTPS, suggest using local backend
      if (error.message.includes('SSL') || error.message.includes('EPROTO')) {
        console.warn('SSL error detected. Consider setting VITE_USE_LOCAL_BACKEND=true in .env.local');
      }
    }
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await getValidToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login or handle auth failure
        window.dispatchEvent(new CustomEvent('auth:failed'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
