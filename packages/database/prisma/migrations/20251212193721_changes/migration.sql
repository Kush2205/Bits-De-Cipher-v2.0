/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserQuestionAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserQuestionAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `questionId` on the `UserQuestionAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserQuestionAnswer" DROP CONSTRAINT "UserQuestionAnswer_questionId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserQuestionAnswer" DROP CONSTRAINT "UserQuestionAnswer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "questionId",
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD CONSTRAINT "UserQuestionAnswer_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "UserQuestionAnswer_questionId_idx" ON "UserQuestionAnswer"("questionId");

-- CreateIndex
CREATE INDEX "UserQuestionAnswer_userId_questionId_idx" ON "UserQuestionAnswer"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
