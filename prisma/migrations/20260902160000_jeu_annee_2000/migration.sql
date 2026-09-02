-- L'année 2000 se détache de la tranche 2000-2009
--
-- Le client applique aux naissances de l'an 2000 des formules différentes de
-- celles des années 2001 à 2009. La tranche posée par
-- `20260821130000_jeu_annees_2000` se resserre donc sur 2001-2009, et un
-- troisième jeu couvre la seule année 2000.
--
-- Les jeux restent créés par migration, jamais depuis l'application : voir le
-- commentaire de tête de app/api/formulaSets/route.ts.
--
-- ⚠️ L'identifiant `formulaset_annees_2000` désigne désormais 2001-2009. Il est
-- conservé tel quel : le renommer obligerait à déplacer les 7 lignes de
-- `math_function` qui s'y rattachent — et avec elles les expressions déjà
-- saisies par l'administrateur — pour un gain purement cosmétique. Le libellé,
-- lui, est corrigé : c'est le seul texte que l'administrateur lit.
--
-- Idempotent : réexécutable sans créer de doublon.

-- 1. La tranche existante ne couvre plus l'an 2000.
UPDATE "formula_set"
SET "label"     = 'Années 2001-2009',
    "yearFrom"  = 2001,
    "yearTo"    = 2009,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'formulaset_annees_2000'
  AND ("yearFrom" IS DISTINCT FROM 2001 OR "yearTo" IS DISTINCT FROM 2009);

-- 2. Le jeu de la seule année 2000.
INSERT INTO "formula_set" ("id", "label", "yearFrom", "yearTo", "createdAt", "updatedAt")
SELECT 'formulaset_annee_2000_seule', 'Année 2000', 2000, 2000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "formula_set" WHERE "id" = 'formulaset_annee_2000_seule'
);

-- 3. Ses 7 expressions, reprises de la tranche dont elle se détache — et non du
--    jeu par défaut : les naissances de l'an 2000 gardent ainsi exactement le
--    comportement qu'elles avaient avant cette migration, jusqu'à ce que
--    l'administrateur saisisse les expressions qui diffèrent réellement.
--    Un jeu incomplet ferait échouer la génération.
INSERT INTO "math_function" ("id", "setId", "number", "expression", "createdAt", "updatedAt")
SELECT
    'mathfunction_a2000seule_' || source."number",
    'formulaset_annee_2000_seule',
    source."number",
    source."expression",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "math_function" source
WHERE source."setId" = 'formulaset_annees_2000'
  AND NOT EXISTS (
      SELECT 1 FROM "math_function" existing
      WHERE existing."setId" = 'formulaset_annee_2000_seule'
        AND existing."number" = source."number"
  );
