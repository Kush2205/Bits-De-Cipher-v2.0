/**
 * Authentication Service
 * 
 * API calls for authentication operations.
 * 
 * Functions:
 * - login(email, password): User login
 * - signup(email, password, name): User registration
 * - logout(): User logout
 * - getCurrentUser(): Get current user data
 * - refreshToken(): Refresh JWT token
 * - googleOAuth(): Initiate Google OAuth flow
 * 
 * Each function returns a Promise with typed response data.
 */

import api from '../lib/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    role?: string;
  };
  accessToken: string;
  refreshToken?: string;
}

// Login with email and password
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

// Register new user
export const signup = async (
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', { email, password, name });
  return response.data;
};

// Logout user
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

// Get current user data
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Refresh access token
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data;
};

// Initiate Google OAuth
export const initiateGoogleOAuth = () => {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  window.location.href = `${backendUrl}/auth/google`;
};
