
// prisma/seed-mathfunctions.ts
// -------------------------------------------
// Seed script pour insérer 7 MathFunctions avec valeurs par défaut
// Utilisation :
//   Dev :   npx tsx prisma/seed-mathfunctions.ts
//   Prod :  npx dotenv -e .env.production -- npx tsx prisma/seed-mathfunctions.ts
//
// Ce script est idempotent : il ne recrée pas les enregistrements existants.
//
// -------------------------------------------

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Lancement du seed des fonctions mathématiques...");

  // Vérifier si des fonctions existent déjà
  const existingCount = await prisma.mathFunction.count();
  if (existingCount > 0) {
    console.log(`ℹ️  ${existingCount} fonctions mathématiques déjà présentes — seed ignoré.`);
    await prisma.$disconnect();
    return;
  }

  // 7 fonctions mathématiques par défaut
  const expressions = [
    "(a1 + a2 + a3 + a4) / 4", // Moyenne des composantes annuelles
    "(m1 * 30 + j1) - (m2 * 28 + j2)", // Différence jours/mois
    "(a1 + m1 + j1) % 9", // Numérologie simple
    "a1 * m2 - a4 * j1", // Pondération croisée
    "((a1 + a4) / 2) + (m1 - j2)", // Moyenne pondérée années/mois/jour
    "(a2 * j1 + a3 * m2) / 2", // Influence combinée
    "abs((a1 + m1 + j1) - (a4 + m2 + j2))", // Écart énergétique global
  ];

  const mathFunctionsData = expressions.map((expr, i) => ({
    number: i + 1,
    expression: expr,
  }));

  await prisma.mathFunction.createMany({
    data: mathFunctionsData,
  });

  console.log(`✅ ${mathFunctionsData.length} fonctions mathématiques créées avec succès.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed des fonctions mathématiques :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

