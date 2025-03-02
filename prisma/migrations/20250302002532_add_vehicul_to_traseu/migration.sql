-- AlterTable
ALTER TABLE "Traseu" ADD COLUMN     "vehiculId" INTEGER;

-- AddForeignKey
ALTER TABLE "Traseu" ADD CONSTRAINT "Traseu_vehiculId_fkey" FOREIGN KEY ("vehiculId") REFERENCES "Vehicul"("id") ON DELETE SET NULL ON UPDATE CASCADE;
