-- DropIndex
DROP INDEX "Answer_userId_questionId_key";

-- CreateTable
CREATE TABLE "HintUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "usedHint1" BOOLEAN NOT NULL DEFAULT false,
    "usedHint2" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HintUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HintUsage_userId_idx" ON "HintUsage"("userId");

-- CreateIndex
CREATE INDEX "HintUsage_questionId_idx" ON "HintUsage"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "HintUsage_userId_questionId_key" ON "HintUsage"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "HintUsage" ADD CONSTRAINT "HintUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HintUsage" ADD CONSTRAINT "HintUsage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
