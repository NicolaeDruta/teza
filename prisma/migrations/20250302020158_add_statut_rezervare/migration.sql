/*
  Warnings:

  - Added the required column `statut` to the `Rezervare` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rezervare" ADD COLUMN     "statut" TEXT NOT NULL;
