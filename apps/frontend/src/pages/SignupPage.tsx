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

import { AuthLayout } from '../components/layout/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

const SignupPage = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;
