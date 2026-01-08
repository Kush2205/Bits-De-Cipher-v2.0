import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { googleLoginUser, loginUser } from '../../store/slices/authSlice';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await dispatch(googleLoginUser(credentialResponse.credential)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Google login failed.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center"> 
        <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-300">Enter your credentials to join the live contest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-700 bg-[#2d2d2d] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-green-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-700 bg-[#2d2d2d] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-green-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/25 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#1a1a1a] px-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape='pill'
            useOneTap
            theme="filled_black"
            size="large"
            text="signin_with"
          />
      </div>

      <p className="text-center text-sm text-gray-300">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-green-400 transition hover:text-green-300">
          Sign up
        </Link>
      </p>
    </div>
  );
};
