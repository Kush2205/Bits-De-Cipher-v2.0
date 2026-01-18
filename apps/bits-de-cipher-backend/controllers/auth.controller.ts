import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import * as authService from "../services/auth.service.ts";
import { validate } from "../middleware/validation.middleware.ts";
import {
  signupSchema,
  loginSchema,
  googleLoginSchema,
  refreshTokenSchema,
} from "../middleware/validation.middleware.ts";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type userRole = "USER"|"ADMIN";

const generateAccessToken = (user: { id: string; role: userRole }): string => {
  return jwt.sign({ userId:user.id , role:user.role }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

const generateRefreshToken = (user: { id: string; role: userRole }): string => {
  return jwt.sign(
    { userId:user.id , role:user.role },
    process.env.JWT_REFRESH_SECRET || "refresh-secret",
    {
      expiresIn: "30d",
    }
  );
};



const signupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authService.createUser(email, hashedPassword, name);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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



const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const { passwordHash, refreshTokenHash, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};


const googleLoginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Google token" });
    }

    const user = await authService.findOrCreateOAuthUser(
      {
        id: payload.sub!,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      "google"
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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


const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refresh-secret"
    ) as { userId: string };

    const user = await authService.findUserById(decoded.userId);
     if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid refresh token" });
  }
};



export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;

    const user = await authService.findUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};



export const logout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const adminSignupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name , adminSecret} = req.body;

    if (adminSecret !== process.env.ADMIN_SIGNUP_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authService.createUser(email, hashedPassword, name , "ADMIN");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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


export const signup = [validate(signupSchema), signupHandler];
export const login = [validate(loginSchema), loginHandler];
export const googleLogin = [validate(googleLoginSchema),googleLoginHandler];
export const refreshToken = [validate(refreshTokenSchema),refreshTokenHandler];
