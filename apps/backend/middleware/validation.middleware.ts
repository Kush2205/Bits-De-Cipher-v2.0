/**
 * Request Validation Middleware
 * 
 * This middleware validates incoming request data before processing.
 * 
 * Libraries to consider:
 * - Zod: TypeScript-first schema validation
 * - Joi: Powerful data validator
 * - express-validator: Express-specific validation
 * 
 * Validation Schemas Needed:
 * 
 * 1. signupSchema:
 *    - email: valid email format, required
 *    - password: min 8 chars, 1 uppercase, 1 number, 1 special char
 *    - name: min 2 chars, max 50 chars, optional
 * 
 * 2. loginSchema:
 *    - email: valid email format, required
 *    - password: required
 * 
 * 3. createQuizSchema:
 *    - title: string, required, min 3 chars
 *    - description: string, optional
 *    - duration: number, required, min 60 seconds
 *    - questions: array, min 1 question
 *      - text: string, required
 *      - options: array, min 2 options, max 6
 *      - correctAnswer: number (index), required
 *      - points: number, default 10
 * 
 * 4. submitAnswerSchema:
 *    - questionId: string, required
 *    - selectedOption: number, required
 *    - timeTaken: number, required
 * 
 * Usage:
 * router.post('/signup', validate(signupSchema), authController.signup);
 */




import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0]?.message,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    next();
  };
};



export const signupSchema = z.object({
  body: z.object({
    email: z
      .string()
      .regex(
        /^\d{2}[a-zA-Z]{2}\d{4}@rgipt\.ac\.in$/,
        "Email must be of form 24cs3063@rgipt.ac.in"
      ),

    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(/[A-Z]/, "One uppercase required")
      .regex(/[0-9]/, "One number required")
      .regex(/[^A-Za-z0-9]/, "One special character required"),

    name: z.string().min(2).max(50),
  }),
});


export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password required"),
  }),
});


export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string().min(1, "Credential required"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token required"),
  }),
});

