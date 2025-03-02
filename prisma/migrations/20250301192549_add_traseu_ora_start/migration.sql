/*
  Warnings:

  - Added the required column `oraStart` to the `Traseu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Traseu" ADD COLUMN     "oraStart" TIMESTAMP(3) NOT NULL;
