/**
 * Quiz Routes
 * 
 * This file handles all quiz-related endpoints:
 * 
 * GET /quiz/list
 * - Protected route
 * - Return all available quizzes with metadata (title, description, questionCount, duration)
 * - Include isPublished filter
 * - Support pagination (skip, take)
 * 
 * GET /quiz/:quizId
 * - Protected route
 * - Return specific quiz details without answers
 * - Include questions and options but not correctAnswer field
 * 
 * POST /quiz/create
 * - Admin only route
 * - Accept quiz data: title, description, duration, questions[]
 * - Validate question structure (text, options, correctAnswer, points)
 * - Create quiz with nested questions and options
 * - Return created quiz
 * 
 * PUT /quiz/:quizId
 * - Admin only route
 * - Update quiz details
 * - Handle nested updates for questions
 * 
 * DELETE /quiz/:quizId
 * - Admin only route
 * - Soft delete or hard delete quiz
 * - Consider cascade deletes for sessions
 * 
 * POST /quiz/:quizId/start
 * - Protected route
 * - Create new QuizSession for user
 * - Set status to 'in_progress'
 * - Record startTime
 * - Return sessionId for WebSocket connection
 * 
 * POST /quiz/session/:sessionId/submit
 * - Protected route
 * - Submit answer for current question
 * - Calculate score based on correctness and time
 * - Update QuizParticipant record
 * - Emit real-time update to leaderboard
 * 
 * GET /quiz/session/:sessionId/results
 * - Protected route
 * - Return final quiz results
 * - Include score, correct answers, time taken
 * - Compare with other participants
 */

import { Router } from 'express';

const router = Router();



export default router;
