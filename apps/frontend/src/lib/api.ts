/**
 * API Client Configuration
 * 
 * Axios instance with default configuration and interceptors.
 * 
 * Features to Implement:
 * 
 * 1. Base Configuration:
 *    - baseURL: Backend API URL from environment
 *    - timeout: Request timeout (10-30 seconds)
 *    - headers: Default headers (Content-Type, etc.)
 * 
 * 2. Request Interceptor:
 *    - Add JWT token to Authorization header
 *    - Format: "Bearer <token>"
 *    - Get token from localStorage/storage
 * 
 * 3. Response Interceptor:
 *    - Handle successful responses
 *    - Extract data from response
 *    - Handle errors globally
 * 
 * 4. Error Handling:
 *    - 401 Unauthorized: Auto-logout or refresh token
 *    - 403 Forbidden: Show permission error
 *    - 404 Not Found: Handle gracefully
 *    - 500 Server Error: Show error message
 *    - Network errors: Show offline message
 * 
 * 5. Token Refresh:
 *    - Detect 401 errors
 *    - Attempt token refresh
 *    - Retry original request with new token
 *    - Logout if refresh fails
 * 
 * 6. Request Queue:
 *    - Queue requests while refreshing token
 *    - Retry queued requests after refresh
 *    - Prevent multiple refresh attempts
 * 
 * Example Usage:
 * import api from './lib/api';
 * 
 * const fetchQuizzes = async () => {
 *   const response = await api.get('/quiz/list');
 *   return response.data;
 * };
 * 
 * const loginUser = async (email, password) => {
 *   const response = await api.post('/auth/login', { email, password });
 *   return response.data;
 * };
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
