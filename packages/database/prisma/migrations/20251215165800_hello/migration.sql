-- DropIndex
DROP INDEX "UserQuestionAnswer_userId_questionId_key";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "correctAnswer" TEXT NOT NULL DEFAULT 'answer';
