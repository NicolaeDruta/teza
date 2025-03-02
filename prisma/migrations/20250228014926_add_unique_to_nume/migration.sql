/*
  Warnings:

  - A unique constraint covering the columns `[nume]` on the table `Utilizator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Utilizator_nume_key" ON "Utilizator"("nume");
