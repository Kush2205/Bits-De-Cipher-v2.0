import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '@repo/db/client';
import * as authService from '../services/auth.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};


const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
    expiresIn: '30d',
  });
};


export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, Password and Name are required' });
    }

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authService.createUser(email, hashedPassword, name);
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};


export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ success: false, message: 'No valid account found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const { passwordHash, refreshTokenHash, ...userWithoutSensitiveData } = user;

    res.json({
      token: accessToken,
      user: userWithoutSensitiveData,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};


export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

   
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const user = await authService.findOrCreateOAuthUser(
      {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      'google'
    );

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};


// Google OAuth Callback Handler
// This endpoint initiates OAuth flow and redirects to Google
export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return res.status(500).json({ 
        success: false, 
        message: 'Google OAuth not configured' 
      });
    }

    // Redirect to Google OAuth
    const redirectUri = `${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'}`;
    const scope = 'openid email profile';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    res.redirect(googleAuthUrl);
  } catch (error) {
    next(error);
  }
};


// Google OAuth Callback Handler
// Receives the authorization code from Google and exchanges it for tokens
export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, error: oauthError } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Handle OAuth error
    if (oauthError) {
      return res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(String(oauthError))}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/auth/callback?error=No+authorization+code+received`);
    }

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken({
      code: String(code),
      redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
    });

    if (!tokens.id_token) {
      return res.redirect(`${frontendUrl}/auth/callback?error=No+ID+token+received`);
    }

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect(`${frontendUrl}/auth/callback?error=Invalid+Google+token`);
    }

    // Find or create user
    const user = await authService.findOrCreateOAuthUser(
      {
        id: payload.sub,
        email: payload.email,
        name: payload.name || null,
        picture: payload.picture || null,
      },
      'google'
    );

    // Generate our app tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?error=Authentication+failed`);
  }
};


export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as { userId: string };

    const accessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};


export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    const user = await authService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get count of unique questions that were actually answered (not skipped)
    // Group by questionId to count unique questions, not total attempts
    const answeredQuestions = await prisma.userQuestionAnswer.groupBy({
      by: ['questionId'],
      where: { userId },
    });
    const answeredCount = answeredQuestions.length;

    res.json({
      success: true,
      user: {
        ...user,
        answeredQuestionsCount: answeredCount,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
