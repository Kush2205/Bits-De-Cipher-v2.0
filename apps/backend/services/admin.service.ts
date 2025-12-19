import prisma from '@repo/db/client';

interface CreateQuestionInput {
  name: string;
  imageUrl?: string | null;
  correctAnswer: string;
  maxPoints: number;
  hints?: Array<{ name: string; hintText: string }>;
}

interface UpdateQuestionInput {
  name?: string;
  imageUrl?: string | null;
  correctAnswer?: string;
  maxPoints?: number;
  points?: number;
}

export const createQuestion = async (input: CreateQuestionInput) => {
  const { hints, ...questionData } = input;

  return prisma.question.create({
    data: {
      ...questionData,
      points: input.maxPoints, // Initial points = maxPoints
      hints: hints
        ? {
            create: hints,
          }
        : undefined,
    },
    include: {
      hints: true,
    },
  });
};

export const updateQuestion = async (questionId: number, updates: UpdateQuestionInput) => {
  return prisma.question.update({
    where: { id: questionId },
    data: updates,
    include: {
      hints: true,
    },
  });
};

export const deleteQuestion = async (questionId: number) => {
  return prisma.question.delete({
    where: { id: questionId },
  });
};

export const getAllQuestions = async () => {
  return prisma.question.findMany({
    orderBy: { id: 'asc' },
    include: {
      hints: {
        select: {
          id: true,
          name: true,
          hintText: true,
        },
      },
    },
  });
};

export const getQuestionById = async (questionId: number) => {
  return prisma.question.findUnique({
    where: { id: questionId },
    include: {
      hints: {
        select: {
          id: true,
          name: true,
          hintText: true,
        },
      },
    },
  });
};

export const createHint = async (data: { questionId: number; name: string; hintText: string }) => {
  return prisma.hint.create({
    data,
  });
};

export const updateHint = async (hintId: number, data: { name?: string; hintText?: string }) => {
  return prisma.hint.update({
    where: { id: hintId },
    data,
  });
};

export const deleteHint = async (hintId: number) => {
  return prisma.hint.delete({
    where: { id: hintId },
  });
};

export const resetUserProgress = async (userId: string) => {
  await prisma.$transaction([
    prisma.userQuestionAnswer.deleteMany({ where: { userId } }),
    prisma.userHintsData.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: 0,
        currentQuestionIndex: 0,
      },
    }),
  ]);
};

export const resetAllProgress = async () => {
  await prisma.$transaction([
    prisma.userQuestionAnswer.deleteMany({}),
    prisma.userHintsData.deleteMany({}),
    prisma.user.updateMany({
      data: {
        totalPoints: 0,
        currentQuestionIndex: 0,
      },
    }),
  ]);

  // Reset all question points to maxPoints
  const questions = await prisma.question.findMany({
    select: { id: true, maxPoints: true },
  });

  await Promise.all(
    questions.map((q) =>
      prisma.question.update({
        where: { id: q.id },
        data: { points: q.maxPoints },
      })
    )
  );
};
