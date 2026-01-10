-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "refreshTokenHash" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "points" INTEGER NOT NULL,
    "maxPoints" INTEGER NOT NULL,
    "correctAnswer" TEXT NOT NULL DEFAULT 'answer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstUserVisit" TIMESTAMP(3),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" SERIAL NOT NULL,
<<<<<<<< HEAD:packages/database/prisma/migrations/20251215145525_init/migration.sql
    "name" TEXT NOT NULL,
========
    "number" INTEGER NOT NULL,
>>>>>>>> feature/mayank:packages/database/prisma/migrations/20260107153328_init_migration/migration.sql
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "Question_name_idx" ON "Question"("name");
<<<<<<<< HEAD:packages/database/prisma/migrations/20251215145525_init/migration.sql
========

-- CreateIndex
CREATE UNIQUE INDEX "Hint_questionId_number_key" ON "Hint"("questionId", "number");
>>>>>>>> feature/mayank:packages/database/prisma/migrations/20260107153328_init_migration/migration.sql

-- CreateIndex
CREATE INDEX "UserQuestionAnswer_questionId_idx" ON "UserQuestionAnswer"("questionId");

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
