/**
 * Passport.js Configuration
 * 
 * Setup authentication strategies for OAuth providers.
 * 
 * Install required packages:
 * - passport
 * - passport-google-oauth20
 * - passport-github2 (if adding GitHub)
 * 
 * Google OAuth Strategy Setup:
 * 
 * 1. Get credentials from Google Cloud Console:
 *    - Go to console.cloud.google.com
 *    - Create project or select existing
 *    - Enable Google+ API
 *    - Create OAuth 2.0 credentials
 *    - Add authorized redirect URI: http://localhost:3000/auth/google/callback
 * 
 * 2. Configure strategy:
 *    passport.use(new GoogleStrategy({
 *      clientID: process.env.GOOGLE_CLIENT_ID,
 *      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
 *      callbackURL: '/auth/google/callback'
 *    }, async (accessToken, refreshToken, profile, done) => {
 *      // Handle user creation/lookup
 *    }));
 * 
 * Strategy Callback Function:
 * - profile contains: id, displayName, emails, photos
 * - Extract user data: id, email, name, picture
 * - Call AuthService.findOrCreateOAuthUser()
 * - Return user via done(null, user)
 * - Handle errors via done(error)
 * 
 * Example profile structure:
 * {
 *   id: '123456789',
 *   displayName: 'John Doe',
 *   emails: [{ value: 'john@example.com', verified: true }],
 *   photos: [{ value: 'https://...' }],
 *   provider: 'google'
 * }
 * 
 * Serialize/Deserialize (if using sessions):
 * - passport.serializeUser: Store userId in session
 * - passport.deserializeUser: Fetch user from database
 * - For JWT-based auth, you might not need this
 * 
 * GitHub OAuth Strategy (optional):
 * - Similar setup with passport-github2
 * - Get credentials from github.com/settings/developers
 * - Profile structure slightly different
 * 
 * Usage in routes:
 * router.get('/auth/google',
 *   passport.authenticate('google', { scope: ['profile', 'email'] })
 * );
 * 
 * router.get('/auth/google/callback',
 *   passport.authenticate('google', { session: false }),
 *   authController.googleOAuthCallback
 * );
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// TODO: Configure Google OAuth strategy
// TODO: Add other OAuth providers as needed (GitHub, etc.)
// TODO: Implement serialization if using sessions

export const configurePassport = () => {
  // Implementation here
};

export default passport;
