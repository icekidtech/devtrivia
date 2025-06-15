/*
  Warnings:

  - Added the required column `correctAnswers` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "answersJson" TEXT,
ADD COLUMN     "correctAnswers" INTEGER NOT NULL,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL;
