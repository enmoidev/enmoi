-- Le jeu de formules des naissances 2000-2009
--
-- Seul cas particulier connu à ce jour. Il est créé ici plutôt que laissé à la
-- main de l'administrateur : l'application n'offre pas de gestion générique des
-- jeux, et celui-ci doit exister partout où la migration passe.
--
-- Ses 7 expressions sont reprises du jeu par défaut, comme point de départ :
-- l'administrateur n'a plus qu'à saisir celles qui diffèrent depuis
-- /admin/formules. Un jeu incomplet ferait échouer la génération.
--
-- Idempotent : réexécutable sans créer de doublon.

INSERT INTO "formula_set" ("id", "label", "yearFrom", "yearTo", "createdAt", "updatedAt")
SELECT 'formulaset_annees_2000', 'Années 2000', 2000, 2009, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "formula_set" WHERE "id" = 'formulaset_annees_2000'
);

INSERT INTO "math_function" ("id", "setId", "number", "expression", "createdAt", "updatedAt")
SELECT
    'mathfunction_a2000_' || source."number",
    'formulaset_annees_2000',
    source."number",
    source."expression",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "math_function" source
JOIN "formula_set" defaut
    ON defaut."id" = source."setId"
   AND defaut."yearFrom" IS NULL
   AND defaut."yearTo" IS NULL
WHERE NOT EXISTS (
    SELECT 1 FROM "math_function" existing
    WHERE existing."setId" = 'formulaset_annees_2000'
      AND existing."number" = source."number"
);
