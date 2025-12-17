/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `correctAnswer` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `currentPoints` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `decayPercent` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint1Penalty` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint1Text` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint1UnlockSec` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint2Penalty` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint2Text` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `hint2UnlockSec` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `minPoints` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `originalPoints` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - The `id` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HintUsage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maxPoints` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_userId_fkey";

-- DropForeignKey
ALTER TABLE "HintUsage" DROP CONSTRAINT "HintUsage_questionId_fkey";

-- DropForeignKey
ALTER TABLE "HintUsage" DROP CONSTRAINT "HintUsage_userId_fkey";

-- DropIndex
DROP INDEX "Question_index_key";

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "correctAnswer",
DROP COLUMN "currentPoints",
DROP COLUMN "decayPercent",
DROP COLUMN "hint1Penalty",
DROP COLUMN "hint1Text",
DROP COLUMN "hint1UnlockSec",
DROP COLUMN "hint2Penalty",
DROP COLUMN "hint2Text",
DROP COLUMN "hint2UnlockSec",
DROP COLUMN "index",
DROP COLUMN "minPoints",
DROP COLUMN "originalPoints",
DROP COLUMN "text",
ADD COLUMN     "maxPoints" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "points" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Answer";

-- DropTable
DROP TABLE "HintUsage";

-- CreateTable
CREATE TABLE "Hint" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "hintText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserHintsData" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "hint1Used" BOOLEAN NOT NULL DEFAULT false,
    "hint2Used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHintsData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestionAnswer" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "submittedText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "awardedPoints" INTEGER NOT NULL,
    "usedHint1" BOOLEAN NOT NULL DEFAULT false,
    "usedHint2" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserQuestionAnswer_questionId_idx" ON "UserQuestionAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionAnswer_userId_questionId_key" ON "UserQuestionAnswer"("userId", "questionId");

-- CreateIndex
CREATE INDEX "Question_name_idx" ON "Question"("name");

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHintsData" ADD CONSTRAINT "UserHintsData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHintsData" ADD CONSTRAINT "UserHintsData_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
