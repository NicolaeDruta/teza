-- AlterTable
ALTER TABLE "Utilizator" ALTER COLUMN "avatar" DROP NOT NULL,
ALTER COLUMN "statut" SET DEFAULT 'In Review',
ALTER COLUMN "evalure" SET DEFAULT 0;
