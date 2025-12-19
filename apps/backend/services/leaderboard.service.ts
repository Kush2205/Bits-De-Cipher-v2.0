import prisma from '@repo/db/client';

export const getTopLeaderboard = async (limit = 15) => {
  const users = await prisma.user.findMany({
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

  // Add answeredQuestionsCount for each user
  const usersWithAnswerCount = await Promise.all(
    users.map(async (user) => {
      const answeredQuestions = await prisma.userQuestionAnswer.groupBy({
        by: ['questionId'],
        where: { userId: user.id },
      });
      return {
        ...user,
        answeredQuestionsCount: answeredQuestions.length,
      };
    })
  );

  return usersWithAnswerCount;
};

export const getAllLeaderboard = async () => {
  const users = await prisma.user.findMany({
    orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      totalPoints: true,
      currentQuestionIndex: true,
    },
  });

  // Add answeredQuestionsCount for each user
  const usersWithAnswerCount = await Promise.all(
    users.map(async (user) => {
      const answeredQuestions = await prisma.userQuestionAnswer.groupBy({
        by: ['questionId'],
        where: { userId: user.id },
      });
      return {
        ...user,
        answeredQuestionsCount: answeredQuestions.length,
      };
    })
  );

  return usersWithAnswerCount;
};
