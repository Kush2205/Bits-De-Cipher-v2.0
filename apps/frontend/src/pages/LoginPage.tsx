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

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && password.length >= 6;

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

  const handleGoogleSuccess = async (cred: any) => {
    setLoading(true);
    try {
      await googleLogin(cred.credential);
      navigate('/dashboard');
    } catch {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500">OR</div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed')} />
        </div>

        <p className="text-center mt-6 text-sm">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
