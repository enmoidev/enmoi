-- Jeux de formules par tranche d'années de naissance
--
-- Les 7 formules existantes deviennent le jeu « Défaut » (tranche nulle), pour
-- qu'aucune expression déjà saisie ne soit perdue. Écrite à la main plutôt que
-- générée : `prisma migrate dev` aurait recréé math_function et vidé la table.

-- 1. Le nouveau modèle
CREATE TABLE "formula_set" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formula_set_pkey" PRIMARY KEY ("id")
);

-- 2. Le jeu par défaut, qui recueille les formules déjà en base.
--    L'identifiant est fixe : les scripts de seed s'y raccrochent sans avoir à
--    le chercher, et une réexécution reste idempotente.
INSERT INTO "formula_set" ("id", "label", "yearFrom", "yearTo", "createdAt", "updatedAt")
VALUES ('formulaset_defaut', 'Défaut', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Rattachement des formules existantes
ALTER TABLE "math_function" ADD COLUMN "setId" TEXT;
UPDATE "math_function" SET "setId" = 'formulaset_defaut' WHERE "setId" IS NULL;
ALTER TABLE "math_function" ALTER COLUMN "setId" SET NOT NULL;

-- 4. L'unicité porte désormais sur le couple (jeu, position)
DROP INDEX IF EXISTS "math_function_number_key";
CREATE UNIQUE INDEX "math_function_setId_number_key" ON "math_function"("setId", "number");

ALTER TABLE "math_function"
    ADD CONSTRAINT "math_function_setId_fkey"
    FOREIGN KEY ("setId") REFERENCES "formula_set"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
