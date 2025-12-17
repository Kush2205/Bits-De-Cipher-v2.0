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

export const fetchLeaderboardData = async (limit : number) => {

    const leaderboardData = await prisma.user.findMany({
        orderBy: {
            totalPoints: 'desc',
        },
        take: limit,
        select: {
            name: true,
            totalPoints: true,
        }
    })
};

export const fetchQuestionDetailsByIndex = async (index: number) => {
    console.log("Fetching question details for index:", index);
    const question = await prisma.question.findUnique({
        where: { id: index},
        select: {
            id: true,
            name: true,
            imageUrl: true,
            points: true,
        }
    });
    console.log(question);
    return question;
};

export const getUserHintsData = async (userId: string, questionId: number) => {
    const hintsData = await prisma.userQuestionAnswer.findFirst({
        where: {
            userId,
            questionId,
        },
        select: {
            usedHint1: true,
            usedHint2: true,
        }
    });
    return hintsData
};

export const updateSubmissionToDB = async (userId: string, questionId: number, answer: string, pointsAwarded: number, isCorrect: boolean) => {

    const hintsData = await getUserHintsData(userId, questionId);
    await prisma.userQuestionAnswer.create({
        data: {
            userId,
            questionId,
            submittedText: answer,
            createdAt: new Date(),
            awardedPoints: pointsAwarded,
            isCorrect,
            usedHint1: hintsData?.usedHint1 || false,
            usedHint2: hintsData?.usedHint2 || false,
        },
    });
};

export const checkAnswer = async (userId: string, questionId: number, userAnswer: string) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId, },
        select: {
            correctAnswer: true,
            points: true,
            maxPoints: true,
        }
    });
    if (!question) return { isCorrect: false, pointsAwarded: 0 };

    const isCorrect = question.correctAnswer === userAnswer;
    let pointsAwarded = 0;
    if (isCorrect) {
        const hintsData = await getUserHintsData(userId, questionId);
        pointsAwarded = calculateAwardedPoints(question.points, {
            usedHint1: hintsData?.usedHint1 || false,
            usedHint2: hintsData?.usedHint2 || false,
        });
        await updateUserStats(userId, pointsAwarded);
        await updateQuestionPoints(questionId, question.points , question.maxPoints);
    }
    await updateSubmissionToDB(userId, questionId, userAnswer, pointsAwarded, isCorrect);
    return { isCorrect, pointsAwarded };

};

export const updateQuestionPoints = async (questionId: number , questionPoints : number , maxPoints: number) => {
  const deduction = 0.05;
  const newPoints = questionPoints - (questionPoints * deduction);
  if (newPoints < maxPoints * 0.5) {
    return;
  }
  await prisma.$transaction(() => {
    return prisma.question.update({
      where: { id: questionId },
      data: { points: newPoints },
    });
  })
};

export const updateUserStats = async (userId: string, pointsToAdd: number) => {
    await prisma.$transaction(() => {
        return prisma.user.update({
            where: { id: userId },
            data: {
                totalPoints: {
                    increment: pointsToAdd,
                },
                currentQuestionIndex: {
                    increment: 1,
                },
            },
        });
    });
};

export const markHintAsUsed = async (userId: string, questionId: number, hintNumber: number) => {
    const updateData: any = {};
    if (hintNumber === 1) {
        updateData.usedHint1 = true;
    } else if (hintNumber === 2) {
        updateData.usedHint2 = true;
    } else {
        throw new Error("Invalid hint number");
    }
    
    
}

export const calculateAwardedPoints = (basePoints: number, hintsData: { usedHint1: boolean; usedHint2: boolean }) => {
    const deduction1 = basePoints * 0.2;
    const deduction2 = basePoints * 0.4;
    let awardedPoints = basePoints - (hintsData.usedHint1 ? deduction1 : 0) - (hintsData.usedHint2 ? deduction2 : 0);
    if (awardedPoints < 0) awardedPoints = 0;
    return awardedPoints;
};























