/*
  Warnings:

  - Added the required column `culoare` to the `Vehicul` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicul" ADD COLUMN     "culoare" TEXT NOT NULL;
