/*
  Warnings:

  - You are about to drop the column `used` on the `Hint` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Hint` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Hint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hint" DROP COLUMN "used",
ADD COLUMN     "name" TEXT NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX "Hint_name_key" ON "Hint"("name");

-- AddForeignKey
ALTER TABLE "UserHintsData" ADD CONSTRAINT "UserHintsData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHintsData" ADD CONSTRAINT "UserHintsData_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
