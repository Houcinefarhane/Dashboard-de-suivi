-- Migration pour ajouter les tables d'objectifs OKR
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer la table FinancialObjective
CREATE TABLE IF NOT EXISTS "FinancialObjective" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "period" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artisanId" TEXT NOT NULL,

    CONSTRAINT "FinancialObjective_pkey" PRIMARY KEY ("id")
);

-- Créer la table KeyResult
CREATE TABLE IF NOT EXISTS "KeyResult" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT '€',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objectiveId" TEXT NOT NULL,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- Créer les contraintes de clé étrangère
ALTER TABLE "FinancialObjective" 
ADD CONSTRAINT "FinancialObjective_artisanId_fkey" 
FOREIGN KEY ("artisanId") REFERENCES "Artisan"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KeyResult" 
ADD CONSTRAINT "KeyResult_objectiveId_fkey" 
FOREIGN KEY ("objectiveId") REFERENCES "FinancialObjective"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "FinancialObjective_artisanId_idx" ON "FinancialObjective"("artisanId");
CREATE INDEX IF NOT EXISTS "KeyResult_objectiveId_idx" ON "KeyResult"("objectiveId");

