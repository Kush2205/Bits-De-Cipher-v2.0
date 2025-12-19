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

export const fetchLeaderboardData = async (limit: number) => {
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
    return leaderboardData;
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

export const getUserHintsData = async (userId: string, questionId: number) => {
    console.log("Getting hints data for:", { userId, questionId });
    const hintsData = await prisma.userHintsData.findFirst({
        where: {
            userId : userId,
            questionId : questionId,
        },
        select: {
            hint1Used: true,
            hint2Used: true,
        }
    });
    console.log("Hints Data:", hintsData);
    return hintsData;
};

export const getHints = async (userId: string, questionId: number, hintNumber: number) => {
    let hintPayload;
    console.log("Fetching hint:", { userId, questionId, hintNumber });
    const hints = await prisma.hint.findFirst({
        where: {
            questionId: questionId,
            hintNumber: hintNumber,
        },
        select: {
            hintText: true,
            hintNumber: true,
        }
    });

    const hintsData = await getUserHintsData(userId, questionId);
    if (!hintsData) {
        if (hintNumber === 1) {
            await markHintAsUsed(userId, questionId, hintNumber);
            return hints?.hintText;
        }
        else {
            return "Please use Hint 1 before accessing Hint 2.";
        }
    }
    if (hintsData) {
        if ((hintNumber === 1 && hintsData.hint1Used) || (hintNumber === 2 && hintsData.hint2Used)) {
            return hints?.hintText;
        }
        else if (hintNumber === 2 && !hintsData.hint1Used) {
            return "Please use Hint 1 before accessing Hint 2.";
        }
        else if (hintNumber === 1 && !hintsData.hint1Used) {
            await markHintAsUsed(userId, questionId, hintNumber);
            return hints?.hintText;
        }
        else if (hintNumber === 2 && !hintsData.hint2Used) {
            await markHintAsUsed(userId, questionId, hintNumber);
            return hints?.hintText;
        }
        else {
            return "Invalid hint request.";
        }
    }
    return "";
}

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
            usedHint1: hintsData?.hint1Used || false,
            usedHint2: hintsData?.hint2Used || false,
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
            hint1Used: hintsData?.hint1Used || false,
            hint2Used: hintsData?.hint2Used || false,
        });
        await updateUserStats(userId, pointsAwarded);
        await updateQuestionPoints(questionId, question.points, question.maxPoints);
    }
    await updateSubmissionToDB(userId, questionId, userAnswer, pointsAwarded, isCorrect);
    return { isCorrect, pointsAwarded };

};

export const updateQuestionPoints = async (questionId: number, questionPoints: number, maxPoints: number) => {
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
    console.log("Marking hint as used:", { userId, questionId, hintNumber });
    if (hintNumber === 1) {
        updateData.hint1Used = true;
    } else if (hintNumber === 2) {
        updateData.hint2Used = true;
    } else {
        throw new Error("Invalid hint number");
    }
    
    const updatedData = await prisma.userHintsData.updateMany({
        where: {
            userId: userId,
            questionId: questionId,
        },
        data: updateData,
    });
    
    console.log("Updated Hint Data:", updatedData);
};

export const calculateAwardedPoints = (basePoints: number, hintsData: { hint1Used: boolean; hint2Used: boolean }) => {
    const deduction1 = basePoints * 0.2;
    const deduction2 = (basePoints - deduction1) * 0.4;
    let awardedPoints = basePoints - (hintsData.hint1Used ? deduction1 : 0) - (hintsData.hint2Used ? deduction2 : 0);
    if (awardedPoints < 0) awardedPoints = 0;
    return awardedPoints;
};

























