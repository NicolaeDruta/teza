/*
  Warnings:

  - You are about to drop the column `evalure` on the `Utilizator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilizator" DROP COLUMN "evalure",
ADD COLUMN     "evaluare" DOUBLE PRECISION NOT NULL DEFAULT 0;
