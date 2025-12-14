/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `maxPoints` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserQuestionAnswer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[index]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPoints` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `decayPercent` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hint1Penalty` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hint1UnlockSec` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hint2Penalty` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hint2UnlockSec` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minPoints` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPoints` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionAnswer" DROP CONSTRAINT "UserQuestionAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionAnswer" DROP CONSTRAINT "UserQuestionAnswer_userId_fkey";

-- DropIndex
DROP INDEX "Question_name_idx";

-- DropIndex
DROP INDEX "Question_name_key";

-- DropIndex
DROP INDEX "User_email_idx";

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "maxPoints",
DROP COLUMN "name",
DROP COLUMN "points",
DROP COLUMN "updatedAt",
ADD COLUMN     "correctAnswer" TEXT NOT NULL,
ADD COLUMN     "currentPoints" INTEGER NOT NULL,
ADD COLUMN     "decayPercent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hint1Penalty" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hint1Text" TEXT,
ADD COLUMN     "hint1UnlockSec" INTEGER NOT NULL,
ADD COLUMN     "hint2Penalty" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hint2Text" TEXT,
ADD COLUMN     "hint2UnlockSec" INTEGER NOT NULL,
ADD COLUMN     "index" INTEGER NOT NULL,
ADD COLUMN     "minPoints" INTEGER NOT NULL,
ADD COLUMN     "originalPoints" INTEGER NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "refreshTokenHash" TEXT,
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "UserQuestionAnswer";

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "submittedText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "awardedPoints" INTEGER NOT NULL,
    "usedHint1" BOOLEAN NOT NULL DEFAULT false,
    "usedHint2" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_userId_questionId_key" ON "Answer"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_index_key" ON "Question"("index");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
