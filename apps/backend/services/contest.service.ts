import prisma from '@repo/db/client';

export const getContestStatus = async () => {
  const totalQuestions = await prisma.question.count();
  const totalUsers = await prisma.user.count();

  return {
    totalQuestions,
    totalUsers,
    isActive: true, // In a real app, this would check contest start/end times
    contestName: 'Bits De Cipher Contest',
  };
};

export const getTotalQuestions = async () => {
  return prisma.question.count();
};

export const getUserProgress = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentQuestionIndex: true,
      totalPoints: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const totalQuestions = await getTotalQuestions();
  const answeredCount = await prisma.userQuestionAnswer.count({
    where: {
      userId,
      isCorrect: true,
    },
  });

  return {
    currentQuestionIndex: user.currentQuestionIndex,
    totalPoints: user.totalPoints,
    totalQuestions,
    answeredCount,
    progress: totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0,
  };
};

export const getContestStats = async () => {
  const [totalQuestions, totalUsers, totalAnswers, correctAnswers] = await Promise.all([
    prisma.question.count(),
    prisma.user.count(),
    prisma.userQuestionAnswer.count(),
    prisma.userQuestionAnswer.count({ where: { isCorrect: true } }),
  ]);

  const topUser = await prisma.user.findFirst({
    orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
    select: {
      name: true,
      email: true,
      totalPoints: true,
    },
  });

  return {
    totalQuestions,
    totalUsers,
    totalAnswers,
    correctAnswers,
    averageAccuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
    topUser,
  };
};
