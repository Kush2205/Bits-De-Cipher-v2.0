import prisma from '@repo/db/client';
import { getIO } from '../socket';

const normalize = (s: string) => s.trim().toLowerCase();
const HINT1_PENALTY = 0.15;
const HINT2_PENALTY = 0.3;
const DECAY_RATE = 0.04; 

export const getUserStats = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      totalPoints: true,
      currentQuestionIndex: true,
    },
  });

  if (!user) return null;

  // Add answeredQuestionsCount
  const answeredQuestions = await prisma.userQuestionAnswer.groupBy({
    by: ['questionId'],
    where: { userId },
  });

  return {
    ...user,
    answeredQuestionsCount: answeredQuestions.length,
  };
};

export const getQuestionByIndex = async (index: number) => {
  const questions = await prisma.question.findMany({
    orderBy: { id: 'asc' },
    skip: index,
    take: 1,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      points: true,
      maxPoints: true,
      hints: {
        select: {
          id: true,
          name: true,
          hintText: true,
        },
      },
      createdAt: true,
    },
  });

  return questions[0] || null;
};

export const useHint = async (userId: string, questionId: number, hintNumber: 1 | 2) => {
  const field = hintNumber === 1 ? 'hint1Used' : 'hint2Used';

  const existing = await prisma.userHintsData.findFirst({ where: { userId, questionId } });
  if (existing) {
    return prisma.userHintsData.update({
      where: { id: existing.id },
      data: { [field]: true },
    });
  }

  return prisma.userHintsData.create({
    data: {
      userId,
      questionId,
      hint1Used: hintNumber === 1,
      hint2Used: hintNumber === 2,
    },
  });
};

export const submitAnswer = async (opts: {
  userId: string;
  questionId: number;
  submittedText: string;
  usedHint1?: boolean;
  usedHint2?: boolean;
}) => {
  const { userId, questionId, submittedText, usedHint1 = false, usedHint2 = false } = opts;

  const result = await prisma.$transaction(async (tx) => {
    const question = await tx.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error('Question not found');

    const minPoints = Math.floor(question.maxPoints * 0.5);

    const alreadyCorrect = Boolean(
      await tx.userQuestionAnswer.findFirst({
        where: { userId, questionId, isCorrect: true },
      })
    );
    const isCorrect = normalize(submittedText) === normalize(question.correctAnswer);

    let awardedPoints = 0;
    if (!alreadyCorrect && isCorrect) {
      // Always calculate points from maxPoints (500), not decayed points
      let penalty = 0;
      if (usedHint1) penalty += HINT1_PENALTY;
      if (usedHint2) penalty += HINT2_PENALTY;
      awardedPoints = Math.max(minPoints, Math.floor(question.maxPoints * (1 - penalty)));
    }

    await tx.userQuestionAnswer.create({
      data: {
        userId,
        questionId,
        submittedText,
        isCorrect,
        awardedPoints,
        usedHint1,
        usedHint2,
      },
    });

    if (!alreadyCorrect && isCorrect) {
      const decayed = Math.max(minPoints, Math.floor(question.points * (1 - DECAY_RATE)));

      await Promise.all([
        tx.user.update({
          where: { id: userId },
          data: {
            totalPoints: { increment: awardedPoints },
            currentQuestionIndex: { increment: 1 },
          },
        }),
        tx.question.update({
          where: { id: questionId },
          data: { points: decayed },
        }),
      ]);
    }

    return {
      isCorrect,
      awardedPoints,
      alreadyCompleted: alreadyCorrect,
    };
  });

  if (result.isCorrect && !result.alreadyCompleted) {
    try {
      getIO().to('game-room').emit('leaderboard:update', {
        userId: opts.userId,
        awardedPoints: result.awardedPoints,
      });
    } catch (err) {
      console.error('Socket emit failed', err);
    }
  }

  return result;
};

export const getHintsForQuestion = async (questionId: number) => {
  return prisma.hint.findMany({
    where: { questionId },
    select: {
      id: true,
      name: true,
      hintText: true,
    },
    orderBy: { id: 'asc' },
  });
};

export const getUserHintUsage = async (userId: string, questionId: number) => {
  return prisma.userHintsData.findFirst({
    where: { userId, questionId },
    select: {
      hint1Used: true,
      hint2Used: true,
    },
  });
};

export const getTopLeaderboard = async (limit = 15) => {
  return prisma.user.findMany({
    orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      totalPoints: true,
      currentQuestionIndex: true,
    },
  });
};

export const getUserAnswers = async (userId: string) => {
  // Get all answers grouped by questionId
  const allAnswers = await prisma.userQuestionAnswer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      question: {
        select: {
          id: true,
          name: true,
          correctAnswer: true,
          maxPoints: true,
        },
      },
    },
  });

  // Keep only the latest answer for each question
  const latestAnswersMap = new Map();
  allAnswers.forEach(answer => {
    if (!latestAnswersMap.has(answer.questionId)) {
      latestAnswersMap.set(answer.questionId, answer);
    }
  });

  // Convert back to array and sort by question ID
  return Array.from(latestAnswersMap.values()).sort((a, b) => a.questionId - b.questionId);
};

export const getTotalQuestionsCount = async () => {
  return prisma.question.count();
};

export const resetUserProgress = async (userId: string) => {
  await prisma.$transaction([
    // Delete all user answers
    prisma.userQuestionAnswer.deleteMany({
      where: { userId },
    }),
    // Delete all hint usage data
    prisma.userHintsData.deleteMany({
      where: { userId },
    }),
    // Reset user stats
    prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: 0,
        currentQuestionIndex: 0,
      },
    }),
  ]);
};


