import prisma  from '@repo/db/client';

export const createUser = async (email: string, hashedPassword: string, name?: string) => {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        totalPoints: true,
        currentQuestionIndex: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return user;
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    throw error;
  }
};


export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};


export const findUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      totalPoints: true,
      currentQuestionIndex: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};


export const findOrCreateOAuthUser = async (
  profile: { id: string; email: string; name?: string; picture?: string },
  provider: 'google'
) => {

  let user = await prisma.user.findUnique({
    where: { googleId: profile.id },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      totalPoints: true,
      currentQuestionIndex: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (user) {
    return user;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (existingUser) {
    // Link Google account to existing user
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: { googleId: profile.id },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        totalPoints: true,
        currentQuestionIndex: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return user;
  }

  user = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.id,
      passwordHash: null, 
    },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      totalPoints: true,
      currentQuestionIndex: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  return user;
};

export const updateUser = async (id: string, data: { name?: string }) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      totalPoints: true,
      currentQuestionIndex: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};


export const updatePassword = async (id: string, newHashedPassword: string) => {
  return await prisma.user.update({
    where: { id },
    data: { passwordHash: newHashedPassword },
  });
};
