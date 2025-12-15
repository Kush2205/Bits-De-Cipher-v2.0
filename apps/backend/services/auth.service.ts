/**
 * Authentication Service
 * 
 * Database operations for authentication.
 * Uses Prisma client from @repo/database package.
 * 
 * createUser(email, hashedPassword, name):
 * - Create new User record with password
 * - Return user object (exclude password)
 * - Handle unique constraint violation (duplicate email)
 * 
 * findUserByEmail(email):
 * - Query User by email
 * - Include password for login verification
 * - Return user or null
 * 
 * findUserById(id):
 * - Query User by id
 * - Exclude password from result
 * - Return user or null
 * 
 * findOrCreateOAuthUser(profile, provider):
 * - profile: { id, email, name, picture }
 * - provider: 'google' | 'github' | etc
 * 
 * Logic:
 * 1. Find Account with provider and providerId
 * 2. If found: return linked User
 * 3. If not found:
 *    a. Check if User exists with this email
 *    b. If yes: create Account linking to existing User
 *    c. If no: create new User (password=null) and Account
 * 4. Return user object
 * 
 * This handles both cases:
 * - New OAuth user: creates User + Account
 * - Existing email user: just links Account to User
 * 
 * updateUser(id, data):
 * - Update user profile (name, etc)
 * - Return updated user
 * 
 * updatePassword(id, newHashedPassword):
 * - Update user password
 * - Used for password reset flow
 */

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
    /
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

  // Create new user
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
