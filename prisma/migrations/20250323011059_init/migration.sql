-- CreateTable
CREATE TABLE "Utilizator" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "parola" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "avatar" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'In Review',
    "tip" TEXT NOT NULL,
    "evaluare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_evaluare" INTEGER NOT NULL DEFAULT 0,
    "data_crearii" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilizator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicul" (
    "id" SERIAL NOT NULL,
    "nume" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "numar" TEXT NOT NULL,
    "culoare" TEXT NOT NULL,
    "capacitate" INTEGER NOT NULL,
    "data_crearii" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soferId" INTEGER NOT NULL,

    CONSTRAINT "Vehicul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "evaluare" DOUBLE PRECISION NOT NULL,
    "descriere" TEXT NOT NULL,
    "data_crearii" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilizatorId" INTEGER NOT NULL,
    "creator" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rezervare" (
    "id" SERIAL NOT NULL,
    "data_crearii" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traseuId" INTEGER NOT NULL,
    "utilizatorId" INTEGER NOT NULL,
    "vehiculId" INTEGER,
    "statut" TEXT NOT NULL,

    CONSTRAINT "Rezervare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plata" (
    "id" SERIAL NOT NULL,
    "metoda" TEXT NOT NULL,
    "suma" DOUBLE PRECISION NOT NULL,
    "data_crearii" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rezervareId" INTEGER NOT NULL,
    "statut" TEXT NOT NULL,
    "paymentIntentId" TEXT,

    CONSTRAINT "Plata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Traseu" (
    "id" SERIAL NOT NULL,
    "durata" INTEGER NOT NULL,
    "data_crearii" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oraStart" TIMESTAMP(3) NOT NULL,
    "vehiculId" INTEGER,

    CONSTRAINT "Traseu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordonate" (
    "id" SERIAL NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "traseuId" INTEGER NOT NULL,

    CONSTRAINT "Coordonate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilizator_email_key" ON "Utilizator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilizator_nume_key" ON "Utilizator"("nume");

-- CreateIndex
CREATE UNIQUE INDEX "Plata_rezervareId_key" ON "Plata"("rezervareId");

-- AddForeignKey
ALTER TABLE "Vehicul" ADD CONSTRAINT "Vehicul_soferId_fkey" FOREIGN KEY ("soferId") REFERENCES "Utilizator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_utilizatorId_fkey" FOREIGN KEY ("utilizatorId") REFERENCES "Utilizator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rezervare" ADD CONSTRAINT "Rezervare_utilizatorId_fkey" FOREIGN KEY ("utilizatorId") REFERENCES "Utilizator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rezervare" ADD CONSTRAINT "Rezervare_traseuId_fkey" FOREIGN KEY ("traseuId") REFERENCES "Traseu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rezervare" ADD CONSTRAINT "Rezervare_vehiculId_fkey" FOREIGN KEY ("vehiculId") REFERENCES "Vehicul"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plata" ADD CONSTRAINT "Plata_rezervareId_fkey" FOREIGN KEY ("rezervareId") REFERENCES "Rezervare"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traseu" ADD CONSTRAINT "Traseu_vehiculId_fkey" FOREIGN KEY ("vehiculId") REFERENCES "Vehicul"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordonate" ADD CONSTRAINT "Coordonate_traseuId_fkey" FOREIGN KEY ("traseuId") REFERENCES "Traseu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
