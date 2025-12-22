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

  const questions = await prisma.question.findMany({
    orderBy: { id: "asc" },
    skip: user.currentQuestionIndex,
    take: 1,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      points: true,
      maxPoints: true,
      activatedAt : true
    },
  });

  const question = questions[0];
  if(!question) return null;

  if (!question.activatedAt) {
    await prisma.question.update({
      where: { id: question.id },
      data: { activatedAt: new Date() },
    });
    question.activatedAt = new Date(); 
  }

  return question;
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


export const getTimeToUnlock = async (questionId: number): Promise<number> => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { activatedAt: true },
  });

  if (!question || !question.activatedAt) {
    return -1;
  }

  const now = Date.now();
  const unlockTime = question.activatedAt.getTime() + HINT_UNLOCK_DELAY;
  const remaining = unlockTime - now;

  return Math.max(0, remaining);
};

const msToHMS = (ms: number) => {
  if (ms <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
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

  const remainingTime = await getTimeToUnlock(questionId);

  if (remainingTime > 0) {
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
  const remainingTime = await getTimeToUnlock(questionId);
  const time = msToHMS(remainingTime);

  if (!canUse) {
    return {
      hintText:
        hintNumber === 2
          ? "Unlock Hint 1 first."
          :`Hint will be Unlocked after ${time.hours} hr ${time.minutes} min ${time.seconds}`,
    };
  }

  const hint = await prisma.hint.findFirst({
    where: {
      questionId,
      hintNumber: hintNumber,
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
  const result = await prisma.$transaction(async (tx) => {

    const question = await tx.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    const alreadyAnswered = await tx.userQuestionAnswer.findFirst({
      where: { userId, questionId, isCorrect: true },
    });

    if (alreadyAnswered) {
      return { isCorrect: false, alreadyAnswered: true , awardPoints:0 };
    }

    const isCorrect =
      submittedText.trim().toLowerCase() ===
      question.correctAnswer.trim().toLowerCase();

    const hints = await tx.userHintsData.findFirst({
      where: { userId, questionId },
    });

    let awardPoints = 0;

    if (isCorrect) {
      let penalty = 0;
      if (hints?.hint1Used) {
        penalty += HINT1_PENALTY;
      }
      if (hints?.hint2Used) {
        penalty += HINT2_PENALTY;
      }

      awardPoints = Math.max(Math.floor(question.points * (1 - penalty)), 0);

      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: { increment: awardPoints },
          currentQuestionIndex: { increment: 1 },
        },
      });

      const newPoints = calculateDecayedPoints(
        question.points,
        question.maxPoints
      );

      await tx.question.update({
        where: { id: questionId },
        data: { points: newPoints },
      });
    }

    await tx.userQuestionAnswer.create({
      data: {
        userId,
        questionId,
        submittedText,
        isCorrect,
        awardedPoints: awardPoints,
        usedHint1: hints?.hint1Used ?? false,
        usedHint2: hints?.hint2Used ?? false,
      },
    });

    return {
      isCorrect,
      awardPoints,
      alreadyAnswered :false
    };
  });

  return result;
};
