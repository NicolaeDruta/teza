/*
  Warnings:

  - Made the column `creator` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "creator" SET NOT NULL;
