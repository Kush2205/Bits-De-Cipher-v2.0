/**
 * Login Page Component
 * 
 * This component renders the login form for users.
 * 
 * Features to Implement:
 * 
 * 1. Email/Password Login Form:
 *    - Email input (with validation)
 *    - Password input (with show/hide toggle)
 *    - "Remember me" checkbox (optional)
 *    - Submit button with loading state
 * 
 * 2. Form Validation:
 *    - Use react-hook-form or similar library
 *    - Validate email format
 *    - Show validation errors inline
 *    - Disable submit while invalid
 * 
 * 3. OAuth Login Buttons:
 *    - "Continue with Google" button
 *    - Redirect to backend OAuth endpoint
 *    - Handle OAuth callback (token in URL)
 * 
 * 4. API Integration:
 *    - POST /auth/login with credentials
 *    - Handle success: save token, redirect to dashboard
 *    - Handle errors: show error message
 *    - Use useAuth hook for authentication logic
 * 
 * 5. Navigation:
 *    - Link to signup page
 *    - "Forgot password?" link (optional)
 *    - Redirect to dashboard if already authenticated
 * 
 * 6. UI/UX:
 *    - Responsive design (mobile-friendly)
 *    - Loading spinner during submission
 *    - Error toast/alert for failed login
 *    - Success feedback before redirect
 * 
 * Example Structure:
 * <div className="login-page">
 *   <h1>Login to Quiz App</h1>
 *   
 *   <form onSubmit={handleLogin}>
 *     <input type="email" name="email" />
 *     <input type="password" name="password" />
 *     <button type="submit">Login</button>
 *   </form>
 *   
 *   <div className="oauth-buttons">
 *     <button onClick={handleGoogleLogin}>
 *       Continue with Google
 *     </button>
 *   </div>
 *   
 *   <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
 * </div>
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login to Quiz App</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              useOneTap
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
