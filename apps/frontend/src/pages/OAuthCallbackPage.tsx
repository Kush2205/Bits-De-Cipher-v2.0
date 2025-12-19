/**
 * OAuth Callback Page Component
 * 
 * Handles OAuth redirect from Google authentication.
 * 
 * Features to Implement:
 * 
 * 1. Extract Token from URL:
 *    - Parse query parameters: ?token=<jwt>
 *    - Or handle error: ?error=<message>
 *    - Use URLSearchParams or useSearchParams hook
 * 
 * 2. Store Token:
 *    - Save JWT to localStorage or sessionStorage
 *    - Or store in httpOnly cookie (more secure)
 *    - Update authentication context
 * 
 * 3. Fetch User Data:
 *    - Call GET /auth/me with token
 *    - Store user data in auth context
 *    - Handle errors (invalid token)
 * 
 * 4. Redirect:
 *    - Redirect to dashboard on success
 *    - Redirect to login on error
 *    - Show loading spinner during process
 * 
 * 5. Error Handling:
 *    - Display error message if OAuth failed
 *    - "Continue to Login" button
 *    - Log error for debugging
 * 
 * Example Flow:
 * 1. Backend redirects here: /auth/callback?token=<jwt>
 * 2. Extract token from URL
 * 3. Save token
 * 4. Update auth state
 * 5. Redirect to /dashboard
 * 
 * Example Structure:
 * <div className="oauth-callback">
 *   <LoadingSpinner />
 *   <p>Completing authentication...</p>
 * </div>
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../services/auth.service';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token or error from URL
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setIsProcessing(false);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          setIsProcessing(false);
          return;
        }

        // Save tokens to localStorage
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Fetch user data with the token
        const userData = await getCurrentUser();
        
        // Update auth context by setting user directly
        // Since we already have the token stored, the auth context will pick it up
        
        // Redirect to contest page (main page after login)
        navigate('/contest', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Completing authentication...</h1>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
