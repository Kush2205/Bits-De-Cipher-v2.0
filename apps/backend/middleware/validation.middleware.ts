/**
 * Request Validation Middleware
 * 
 * This middleware validates incoming request data before processing.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation Schemas

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const submitAnswerSchema = z.object({
  questionId: z.union([z.string(), z.number()]).transform((val: string | number) => Number(val)),
  submittedText: z.string().min(1, 'Answer is required'),
  usedHint1: z.boolean().optional(),
  usedHint2: z.boolean().optional(),
});

export const useHintSchema = z.object({
  questionId: z.union([z.string(), z.number()]).transform((val: string | number) => Number(val)),
  hintNumber: z.union([z.literal(1), z.literal(2)], {
    errorMap: () => ({ message: 'Hint number must be 1 or 2' }),
  }),
});

export const createQuestionSchema = z.object({
  name: z.string().min(3, 'Question name must be at least 3 characters'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  maxPoints: z.number().int().min(1, 'Max points must be at least 1'),
  hints: z
    .array(
      z.object({
        name: z.string().min(1, 'Hint name is required'),
        hintText: z.string().min(1, 'Hint text is required'),
      })
    )
    .optional(),
});

export const updateQuestionSchema = z.object({
  name: z.string().min(3, 'Question name must be at least 3 characters').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  correctAnswer: z.string().min(1, 'Correct answer is required').optional(),
  maxPoints: z.number().int().min(1, 'Max points must be at least 1').optional(),
  points: z.number().int().min(1, 'Points must be at least 1').optional(),
});

export const createHintSchema = z.object({
  name: z.string().min(1, 'Hint name is required'),
  hintText: z.string().min(1, 'Hint text is required'),
});

export const updateHintSchema = z.object({
  name: z.string().min(1, 'Hint name is required').optional(),
  hintText: z.string().min(1, 'Hint text is required').optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

export const questionIdParamSchema = z.object({
  questionId: z.string().regex(/^\d+$/, 'Question ID must be a number').transform(Number),
});

// Validation middleware factory
type ValidateTarget = 'body' | 'params' | 'query';

export const validate = (schema: z.ZodSchema, target: ValidateTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = target === 'body' ? req.body : target === 'params' ? req.params : req.query;
      const validated = schema.parse(data);
      
      // Replace the original data with validated data
      if (target === 'body') req.body = validated;
      else if (target === 'params') req.params = validated as any;
      else req.query = validated as any;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((err: z.ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
