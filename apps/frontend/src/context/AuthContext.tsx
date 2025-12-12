/**
 * Authentication Context
 * 
 * Global context for managing authentication state across the app.
 * 
 * Context Value:
 * - user: Current user object { id, email, name, role }
 * - isAuthenticated: Boolean status
 * - isLoading: Initial auth check loading state
 * - login: Login function
 * - signup: Signup function
 * - logout: Logout function
 * - refreshToken: Token refresh function
 * 
 * Features to Implement:
 * 
 * 1. Initial Authentication Check:
 *    - On app load, check for stored token
 *    - Verify token validity (GET /auth/me)
 *    - Set user state if valid
 *    - Clear token if invalid
 * 
 * 2. Login Implementation:
 *    - POST /auth/login
 *    - Store JWT in localStorage/sessionStorage
 *    - Update user state
 *    - Handle errors
 * 
 * 3. Signup Implementation:
 *    - POST /auth/signup
 *    - Auto-login after signup
 *    - Store token and user data
 * 
 * 4. Logout Implementation:
 *    - Clear token from storage
 *    - Reset user state to null
 *    - Optionally call backend logout
 * 
 * 5. Token Management:
 *    - Store in localStorage or httpOnly cookies
 *    - Auto-refresh before expiration
 *    - Handle refresh token rotation
 * 
 * 6. Axios Interceptors:
 *    - Add token to all API requests
 *    - Handle 401 errors (auto-logout)
 *    - Retry failed requests after token refresh
 * 
 * Provider Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * Hook Usage:
 * const { user, login, logout } = useAuth();
 */

import { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Initialize auth on mount
  useEffect(() => {
    // Check for stored token
    // Verify token validity
    // Set user state
    setIsLoading(false);
  }, []);

  // TODO: Implement auth functions
  const login = async (email: string, password: string) => {
    // Implementation here
  };

  const signup = async (email: string, password: string, name?: string) => {
    // Implementation here
  };

  const logout = async () => {
    // Implementation here
  };

  const refreshToken = async () => {
    // Implementation here
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
