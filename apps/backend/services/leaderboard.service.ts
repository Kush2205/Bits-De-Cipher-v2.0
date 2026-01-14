import prisma from '@repo/db/client';

export const getTopLeaderboard = async (limit = 15) => {
  return prisma.user.findMany({
    where:{
      role:"USER"
    },
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

export const getAllLeaderboard = async () => {
  return prisma.user.findMany({
    where:{
      role:"USER"
    },
    orderBy: [{ totalPoints: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      totalPoints: true,
      currentQuestionIndex: true,
    },
  });
};
