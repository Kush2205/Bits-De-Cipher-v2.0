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

import PrismaClient  from '@repo/db/client';

// TODO: Implement service functions

export const createUser = async (email: string, hashedPassword: string, name?: string) => {
  // Implementation here
};

export const findUserByEmail = async (email: string) => {
  // Implementation here
};

export const findUserById = async (id: string) => {
  // Implementation here
};

export const findOrCreateOAuthUser = async (profile: any, provider: string) => {
  // Implementation here
};

export const updateUser = async (id: string, data: any) => {
  // Implementation here
};

export const updatePassword = async (id: string, newHashedPassword: string) => {
  // Implementation here
};
