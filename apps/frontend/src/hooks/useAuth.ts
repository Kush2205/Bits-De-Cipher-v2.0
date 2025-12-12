/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication context and methods.
 * 
 * Returns:
 * - user: Current user object or null
 * - isAuthenticated: Boolean authentication status
 * - isLoading: Loading state while checking auth
 * - login: Function to login with email/password
 * - signup: Function to register new user
 * - logout: Function to logout user
 * - refreshToken: Function to refresh access token
 * 
 * Features to Implement:
 * 
 * 1. Login Function:
 *    - POST /auth/login with email/password
 *    - Save JWT token to storage
 *    - Update user state
 *    - Return success/error
 * 
 * 2. Signup Function:
 *    - POST /auth/signup with user data
 *    - Auto-login after successful signup
 *    - Save token and update state
 * 
 * 3. Logout Function:
 *    - Clear token from storage
 *    - Clear user state
 *    - Optionally call backend logout endpoint
 *    - Redirect to login page
 * 
 * 4. Token Refresh:
 *    - Check token expiration
 *    - Refresh before expiry
 *    - Handle refresh failure
 * 
 * 5. Persistence:
 *    - Load user from token on app start
 *    - Verify token validity
 *    - Handle expired tokens
 * 
 * Example Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * const handleLogin = async (email, password) => {
 *   try {
 *     await login(email, password);
 *     navigate('/dashboard');
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 */

import { useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  // TODO: Get context from AuthContext
  // TODO: Throw error if used outside provider
  // TODO: Return auth methods and state
  
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async (email: string, password: string) => {},
    signup: async (email: string, password: string, name?: string) => {},
    logout: async () => {},
    refreshToken: async () => {}
  };
};
