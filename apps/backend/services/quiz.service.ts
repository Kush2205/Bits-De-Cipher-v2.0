import prisma from "@repo/db/client";


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

export const fetchLeaderboardData = async () => {
    const leaderboardData = await prisma.user.findMany({
        orderBy: {
            totalPoints: 'desc',
        },
        select: {
          name: true,
          totalPoints: true,
        }
      })
};

export const fetchQuestionDetailsByIndex = async (index: number) => {
    const question = await prisma.question.findUnique({
        where: { id: index },
        select: {
            id: true,
            name: true,
            imageUrl: true,
            points: true,
        }
    });
    return question;
};

export const getUserHintsData = async (userId: string , questionId : number) => {

};








