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

const LoginPage = () => {
  // TODO: Implement login logic
  // TODO: Add form state management
  // TODO: Add OAuth handlers
  // TODO: Add error handling
  
  return (
    <div>
      <h1>Login Page</h1>
      {/* Implementation here */}
    </div>
  );
};

export default LoginPage;
