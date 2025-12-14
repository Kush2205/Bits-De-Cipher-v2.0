import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // TODO: Get token from storage
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

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  async (error) => {
    // TODO: Handle different error types
    
    // 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // TODO: Attempt token refresh
      // TODO: Logout if refresh fails
    }
    
    // TODO: Handle other error codes
    
    return Promise.reject(error);
  }
);

export default api;
