/**
 * Signup Page Component
 * 
 * This component renders the signup/registration form.
 * 
 * Features to Implement:
 * 
 * 1. Signup Form Fields:
 *    - Name input (optional or required)
 *    - Email input (with validation)
 *    - Password input (with strength meter)
 *    - Confirm password input
 *    - Terms & conditions checkbox
 *    - Submit button with loading state
 * 
 * 2. Password Strength Indicator:
 *    - Visual feedback (weak/medium/strong)
 *    - Show requirements: 8+ chars, uppercase, number, special
 *    - Update in real-time as user types
 * 
 * 3. Form Validation:
 *    - Email format validation
 *    - Password strength validation
 *    - Passwords match check
 *    - Show errors inline below fields
 * 
 * 4. OAuth Signup Buttons:
 *    - "Sign up with Google" button
 *    - Same flow as login OAuth
 *    - Handle OAuth callback
 * 
 * 5. API Integration:
 *    - POST /auth/signup with form data
 *    - Handle success: auto-login with returned token
 *    - Handle errors: email already exists, etc.
 *    - Show appropriate error messages
 * 
 * 6. Navigation:
 *    - Link to login page
 *    - Redirect to dashboard after successful signup
 *    - Redirect to login if already authenticated
 * 
 * 7. UI/UX:
 *    - Responsive design
 *    - Loading state during submission
 *    - Success message before redirect
 *    - Clear error messages
 * 
 * Example Structure:
 * <div className="signup-page">
 *   <h1>Create Account</h1>
 *   
 *   <form onSubmit={handleSignup}>
 *     <input type="text" name="name" placeholder="Full Name" />
 *     <input type="email" name="email" placeholder="Email" />
 *     <input type="password" name="password" placeholder="Password" />
 *     <PasswordStrengthMeter password={password} />
 *     <input type="password" name="confirmPassword" placeholder="Confirm Password" />
 *     <button type="submit">Sign Up</button>
 *   </form>
 *   
 *   <div className="oauth-buttons">
 *     <button onClick={handleGoogleSignup}>
 *       Sign up with Google
 *     </button>
 *   </div>
 *   
 *   <p>Already have an account? <Link to="/login">Login</Link></p>
 * </div>
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, googleLogin, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const strength = passwordStrength(password);
  const passwordsMatch = password === confirmPassword;

  const isFormValid =
    email &&
    strength >= 3 &&
    passwordsMatch &&
    acceptTerms;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // AuthContext.signup expects positional args: (email, password, name?)
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (cred: any) => {
    try {
      await googleLogin(cred.credential);
      navigate('/dashboard');
    } catch {
      setError('Google signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          {/* Password strength */}
          <div className="text-sm">
            <p>Password strength:</p>
            <div className="h-2 bg-gray-200 rounded">
              <div
                className={`h-2 rounded ${
                  strength <= 1 ? 'bg-red-500 w-1/4'
                  : strength === 2 ? 'bg-yellow-500 w-2/4'
                  : 'bg-green-500 w-full'
                }`}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Use 8+ chars, uppercase, number & special character
            </p>
          </div>

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          {!passwordsMatch && (
            <p className="text-sm text-red-500">Passwords do not match</p>
          )}

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mr-2"
            />
            I agree to the Terms & Conditions
          </label>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500">OR</div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSignup} />
        </div>

        <p className="text-center mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
