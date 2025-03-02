-- DropForeignKey
ALTER TABLE "Rezervare" DROP CONSTRAINT "Rezervare_vehiculId_fkey";

-- AlterTable
ALTER TABLE "Rezervare" ALTER COLUMN "vehiculId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Rezervare" ADD CONSTRAINT "Rezervare_vehiculId_fkey" FOREIGN KEY ("vehiculId") REFERENCES "Vehicul"("id") ON DELETE SET NULL ON UPDATE CASCADE;
