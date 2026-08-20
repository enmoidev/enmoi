// Seed des 7 formules mathématiques
//
//   Dev  : npx tsx prisma/seed-mathfunctions.ts
//   Prod : npx dotenv -e .env.production -- npx tsx prisma/seed-mathfunctions.ts
//
// Idempotent : ne recrée pas les formules déjà enregistrées.
//
// ⚠️ CES FORMULES SONT DES PLACEHOLDERS TECHNIQUES, PAS LES FORMULES MÉTIER.
//
// Elles garantissent seulement un résultat entier entre 0 et 99, ce qui permet
// de faire tourner la chaîne complète (calcul → sélection des visuels → PDF) sans
// attendre le client. Les forces qu'elles désignent n'ont AUCUNE signification.
// Un PMI produit avec ces expressions est un document de test : il ne doit jamais
// être remis à une personne réelle.
//
// Les vraies expressions sont à saisir depuis /admin/formules dès que le client
// les aura fournies.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PLACEHOLDER_EXPRESSIONS } from "./mathFunctionPlaceholders";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed des formules mathématiques...");

  const existingCount = await prisma.mathFunction.count();
  if (existingCount > 0) {
    console.log(`  ${existingCount} formule(s) déjà présente(s) — seed ignoré.`);
    return;
  }

  await prisma.mathFunction.createMany({
    data: PLACEHOLDER_EXPRESSIONS.map((expression, index) => ({
      number: index + 1,
      expression,
    })),
  });

  console.log(`  ${PLACEHOLDER_EXPRESSIONS.length} formules créées.`);
  console.log("  ⚠️ Ce sont des placeholders : les forces désignées n'ont aucun sens métier.");
  console.log("  Saisissez les vraies expressions depuis /admin/formules.");
}

main()
  .catch((err) => {
    console.error("Échec du seed des formules :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
