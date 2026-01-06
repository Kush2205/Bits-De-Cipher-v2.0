import prisma from '@repo/db/client';
import { getIO } from '../socket';

const normalize = (s: string) => s.trim().toLowerCase();
const HINT1_PENALTY = 0.15;
const HINT2_PENALTY = 0.3;
const DECAY_RATE = 0.04; 
const HINT_UNLOCK_MS = 3 * 60 * 60 * 1000;

export class HintLockedError extends Error {
  statusCode = 403;
  unlocksAt: Date;
  remainingMs: number;

  constructor(unlocksAt: Date, remainingMs: number) {
    const msg = formatHintLockedMessage(unlocksAt, remainingMs);
    super(msg);
    this.name = 'HintLockedError';
    this.unlocksAt = unlocksAt;
    this.remainingMs = remainingMs;
  }
}

const formatHintLockedMessage = (unlocksAt: Date, remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `Hints will be unlocked in ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const ensureFirstUserVisit = async (questionId: number) => {
  const now = new Date();

  await prisma.question.updateMany({
    where: { id: questionId, firstUserVisit: null },
    data: { firstUserVisit: now },
  });

  
  const persisted = await prisma.question.findUnique({
    where: { id: questionId },
    select: { firstUserVisit: true },
  });

  return persisted?.firstUserVisit ?? now;
};

const getHintUnlockInfo = (firstUserVisit: Date | null) => {
  const start = firstUserVisit ?? new Date();
  const unlocksAt = new Date(start.getTime() + HINT_UNLOCK_MS);
  const remainingMs = unlocksAt.getTime() - Date.now();
  return { unlocksAt, remainingMs, isUnlocked: remainingMs <= 0 };
};

export const getUserStats = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      totalPoints: true,
      currentQuestionIndex: true,
    },
  });
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
      firstUserVisit: true,
      hints: {
        select: {
          id: true,
          number: true,
          hintText: true,
        },
      },
      createdAt: true,
    },
  });

  const question = questions[0] || null;
  if (!question) return null;

  if (!question.firstUserVisit) {
    question.firstUserVisit = await ensureFirstUserVisit(question.id);
  }

  const { isUnlocked } = getHintUnlockInfo(question.firstUserVisit);

  if (!isUnlocked) {
    question.hints = question.hints.map((h) => ({ ...h, hintText: '' }));
  }

  return question;
};

export const useHint = async (userId: string, questionId: number, hintNumber: 1 | 2) => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      firstUserVisit: true,
      hints: { select: { number: true, hintText: true } },
    },
  });

  if (!question) {
    throw new Error('Question not found');
  }

  if (!question.firstUserVisit) {
    question.firstUserVisit = await ensureFirstUserVisit(question.id);
  }

  const { unlocksAt, remainingMs, isUnlocked } = getHintUnlockInfo(question.firstUserVisit);
  if (!isUnlocked) {
    throw new HintLockedError(unlocksAt, remainingMs);
  }

  const field = hintNumber === 1 ? 'hint1Used' : 'hint2Used';

  const existing = await prisma.userHintsData.findFirst({ where: { userId, questionId } });
  if (existing) {
    await prisma.userHintsData.update({
      where: { id: existing.id },
      data: { [field]: true },
    });
  } else {
    await prisma.userHintsData.create({
      data: {
        userId,
        questionId,
        hint1Used: hintNumber === 1,
        hint2Used: hintNumber === 2,
      },
    });
  }

  const hint = question.hints.find((h) => h.number === hintNumber);
  return {
    hintNumber,
    hintText: hint?.hintText ?? '',
  };
};

export const submitAnswer = async (opts: {
  userId: string;
  questionId: number;
  submittedText: string;
  usedHint1?: boolean;
  usedHint2?: boolean;
}) => {
  const { userId, questionId, submittedText } = opts;

  const result = await prisma.$transaction(async (tx) => {
    const question = await tx.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error('Question not found');

    const minPoints = Math.floor(question.maxPoints * 0.5);

    const hintUsage = await tx.userHintsData.findFirst({ where: { userId, questionId } });
    const usedHint1 = hintUsage?.hint1Used ;
    const usedHint2 = hintUsage?.hint2Used;

    const alreadyCorrect = Boolean(
      await tx.userQuestionAnswer.findFirst({
        where: { userId, questionId, isCorrect: true },
      })
    );
    const isCorrect = normalize(submittedText) === normalize(question.correctAnswer);

    let awardedPoints = 0;
    if (!alreadyCorrect && isCorrect) {
      let penalty = 0;
      let toBeAwarded=question.points

      if (usedHint1) toBeAwarded -=(HINT1_PENALTY)*toBeAwarded;
      if (usedHint2) toBeAwarded -=( HINT2_PENALTY)*toBeAwarded;
      awardedPoints = Math.max(minPoints, Math.floor(toBeAwarded));
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

    let updatedUser = null;
    let nextQuestion = null;

    if (!alreadyCorrect && isCorrect) {
      const decayed = Math.max(minPoints, Math.floor(question.points * (1 - DECAY_RATE)));

      const [user] = await Promise.all([
        tx.user.update({
          where: { id: userId },
          data: {
            totalPoints: { increment: awardedPoints },
            currentQuestionIndex: { increment: 1 },
          },
          select: {
            id: true,
            totalPoints: true,
            currentQuestionIndex: true,
          },
        }),
        tx.question.update({
          where: { id: questionId },
          data: { points: decayed },
        }),
      ]);

      updatedUser = user;

      const nextQuestions = await tx.question.findMany({
        orderBy: { id: 'asc' },
        skip: user.currentQuestionIndex,
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
              number: true,
              hintText: true,
            },
          },
          createdAt: true,
        },
      });

      nextQuestion = nextQuestions[0] || null;
    }

    return {
      isCorrect,
      awardedPoints,
      alreadyCompleted: alreadyCorrect,
      totalPoints: updatedUser?.totalPoints,
      currentQuestionIndex: updatedUser?.currentQuestionIndex,
      nextQuestion,
    };
  });

  if (result.isCorrect && !result.alreadyCompleted) {
    try {
      getIO().to('game-room').emit('leaderboard:update', {
        userId: opts.userId,
        awardedPoints: result.awardedPoints,
        totalPoints: result.totalPoints,
        currentQuestionIndex: result.currentQuestionIndex,
      });

      // Broadcast decayed points for the current question so other users see live available points
      // result.currentQuestionIndex reflects the user's next index, so use questionId from input
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: opts.questionId },
        select: { id: true, points: true },
      });

      if (updatedQuestion) {
        getIO().to('game-room').emit('question:pointsUpdate', {
          questionId: updatedQuestion.id,
          points: updatedQuestion.points,
        });
      }
    } catch (err) {
      console.error('Socket emit failed', err);
    }
  }

  return result;
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


