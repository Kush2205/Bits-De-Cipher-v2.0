import prisma from "@repo/db/client";

const HINT1_PENALTY = 0.15;
const HINT2_PENALTY = 0.3;
const DECAY_RATE = 0.05;
const MIN_POINTS_FACTOR = 0.2;
const HINT_UNLOCK_DELAY = 3 * 60 * 60 * 1000;

export const getUserStats = async (userId: string) => {
  const userStats = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentQuestionIndex: true,
      totalPoints: true,
    },
  });

  return userStats;
};

export const calculateDecayedPoints = (
  currentPoints: number,
  maxPoints: number
): number => {
  const minPoints = Math.floor(maxPoints * MIN_POINTS_FACTOR);
  const decayed = currentPoints - maxPoints * DECAY_RATE;
  return Math.max(Math.floor(decayed), minPoints);
};

export const getCurrentQuestion = async (userId: string) => {
  const user = await getUserStats(userId);
  if (!user) return null;

  const currentQuestion = await prisma.question.findUnique({
    where: { id: user.currentQuestionIndex },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      points: true,
    },
  });
  return currentQuestion;
};

export const moveToNextQuestion = async (userId: string) => {
  const nextQuestion = await prisma.user.update({
    where: { id: userId },
    data: {
      currentQuestionIndex: { increment: 1 },
    },
    select: {
      currentQuestionIndex: true,
    },
  });

  return nextQuestion;
};


export const canUseHint = async (
  userId: string,
  questionId: number,
  hintNumber: 1 | 2
) => {
  let data = await prisma.userHintsData.findFirst({
    where: { userId, questionId },
  });

  
  if (!data) {
    data = await prisma.userHintsData.create({
      data: { userId, questionId },
    });
  }

  const now = Date.now();
  const unlockTime = data.createdAt.getTime() + HINT_UNLOCK_DELAY;

  if (now < unlockTime) {
    return false;
  }

  if (hintNumber === 1) {
    return true;
  }

  if (hintNumber === 2) {
    return data.hint1Used === true;
  }

  return false;
};


export const useHint = async (
  userId: string,
  questionId: number,
  hintNumber: 1 | 2
) => {
  const canUse = await canUseHint(userId, questionId, hintNumber);

  if (!canUse) {
    return {
      hintText:
        hintNumber === 2
          ? "Unlock Hint 1 first."
          : "Hint will be Unlocked after 3 hr",
    };
  }

  const hint = await prisma.hint.findFirst({
    where: {
      questionId,
      id :hintNumber,
    },
    select: {
      hintText: true,
    },
  });

  if (!hint) {
    throw new Error("Hint not found");
  }

  const existing = await prisma.userHintsData.findFirst({
    where: { userId, questionId },
  });

  if (existing) {
    await prisma.userHintsData.update({
      where: { id: existing.id },
      data: hintNumber === 1 ? { hint1Used: true } : { hint2Used: true },
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

  return {
    hintText: hint.hintText,
    penalty: hintNumber === 1 ? HINT1_PENALTY : HINT2_PENALTY,
  };
};


export const submitAnswer = async (
  userId: string,
  questionId: number,
  submittedText: string
) => {
  // TODO:
  // 1. fetch question
  // 2. check correctness
  // 3. apply hint penalties
  // 4. award points
  // 5. decay question points
  // 6. update user + question + answer tables
};
