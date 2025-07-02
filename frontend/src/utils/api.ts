import axios from 'axios';

// Debug environment variables
console.log('🔧 Environment Debug:');
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('All env vars:', import.meta.env);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rail-madad-backend.onrender.com';

console.log('🚀 Final API_BASE_URL:', API_BASE_URL);

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased for Render free tier
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('📡 Making request to:', (config.baseURL || '') + (config.url || ''));
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    console.log('✅ Response received from:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.message);
    console.error('❌ URL that failed:', error.config?.url);
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };