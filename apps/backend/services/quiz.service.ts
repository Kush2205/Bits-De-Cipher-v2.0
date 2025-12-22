import prisma from "@repo/db/client";


// ───────── USER STATS ─────────
export const getUserStats = async (userId:string) => {
   const userStats= await prisma.user.findUnique({
       where:{id:userId},
       select:{
        currentQuestionIndex: true,
        totalPoints: true,
        name:true,
       }
   });

   return userStats;
};




// ───────── LEADERBOARD ─────────
export const fetchLeaderboardData = async (limit:number) => {
    const leaderboardData= await prisma.user.findMany({
        orderBy:[{totalPoints:'desc'}],
        take:limit,
        select:{
          name:true,
          totalPoints:true,
        }
    });
    return leaderboardData;
};




// ───────── QUESTIONS ─────────
export const fetchQuestionDetailsByIndex = async (index:number) => {
     const questionDetails= await prisma.question.findUnique({
          where: { id: index },
          select:{
            id: true,
            name: true,
            imageUrl: true,
            points: true,
          }
     });
     return questionDetails;
};





// ───────── HINT SYSTEM ─────────
export const getUserHintsData = async (userId: string,questionId: number) => {
    const UserhintsData =await prisma.userHintsData.findMany({
        where:{
             userId,
             questionId,
        },
        select:{
           hint1Used: true,
           hint2Used: true,
        }

    });
    return UserhintsData;
};
export const getHints = async (questionId:number) => {
     const hints = await prisma.hint.findMany({
       where:{questionId},
        select:{
          id:true,
          hintText:true,
        }
     });
     return hints;
};




export const markHintAsUsed = async (
  userId: string,
  questionId: number,
  hintNumber: 1 | 2
) => {
  const updateData =
    hintNumber === 1
      ? { hint1Used: true }
      : { hint2Used: true };

  const existing = await prisma.userHintsData.findFirst({
    where: { userId, questionId },
  });

  if (existing) {
    await prisma.userHintsData.updateMany({
      where: { userId, questionId },
      data: updateData,
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
};










// ───────── ANSWER & SCORING ─────────
export const validateAnswer = async (
  questionId: number, userAnswer: string
) => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      correctAnswer: true,
      points: true,
      maxPoints: true,
    },
  });

  if (!question) return null;
  const isCorrect =
    question.correctAnswer.trim().toLowerCase() ===
    userAnswer.trim().toLowerCase();

  return {
    isCorrect,
    points: question.points,
    maxPoints: question.maxPoints,
  };
};


export const calculateAwardedPoints = (
  basePoints: number,
  hints: {
    hint1Used: boolean;
    hint2Used: boolean;
  }
) => {
  let points = basePoints;
  if (hints.hint1Used) {
    points -= basePoints * 0.05;
  }
  if (hints.hint2Used) {
    points -= basePoints * 0.10; 
  }

  return Math.max(Math.floor(points), 0);
};


export const computePoints = async (
  userId: string, questionId: number,basePoints: number
) => {
  const hintsData = await prisma.userHintsData.findFirst({
    where: { userId, questionId },
    select: {
      hint1Used: true,
      hint2Used: true,
    },
  });

  return calculateAwardedPoints(basePoints, {hint1Used: hintsData?.hint1Used ?? false, hint2Used: hintsData?.hint2Used ?? false,
  });
};


export const updateSubmissionToDB = async (
  userId: string,
  questionId: number,
  userAnswer: string,
  pointsAwarded: number,
  isCorrect: boolean
) => {
  await prisma.userQuestionAnswer.create({
    data: {
      userId,
      questionId,
      submittedText: userAnswer,
      awardedPoints: pointsAwarded,
      isCorrect,
    },
  });
};








export const updateUserStats = async (
  userId: string,
  pointsAwarded: number
) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalPoints: { increment: pointsAwarded },
      currentQuestionIndex: { increment: 1 },
    },
  });
};



