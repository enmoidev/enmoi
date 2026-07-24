// Seed des 100 forces — crée les lignes manquantes sans écraser les titres déjà saisis
//
//   Dev  : npx tsx prisma/seed-forces.ts
//   Prod : npx dotenv -e .env.production -- npx tsx prisma/seed-forces.ts
//
// Idempotent : relançable sans risque. Les visuels (pageAKey / pageBKey) sont
// déposés par le client depuis le back-office, jamais par ce script.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const TOTAL_FORCES = 100;

/// Titres confirmés par les visuels livrés par le client.
/// Les forces absentes de cette table reçoivent un titre provisoire, à corriger
/// depuis le back-office au fur et à mesure des livraisons.
const KNOWN_TITLES: Record<number, string> = {
  1: "La Créative audacieuse",
  2: "La Flamme",
  3: "L'Harmonisatrice",
  4: "La Perfectionniste",
  5: "La Communicante",
  6: "L'Opportuniste ardente",
  7: "La Meneuse",
  8: "L'Intuitive optimiste",
  9: "La Gardienne des valeurs",
  10: "La Bâtisseuse fraternelle",
};

function titleFor(number: number): string {
  return KNOWN_TITLES[number] ?? `Force ${number} — titre à renseigner`;
}

async function main() {
  console.log("Seed des forces...");

  const existing = await prisma.force.findMany({ select: { number: true } });
  const existingNumbers = new Set(existing.map((f) => f.number));

  const toCreate = [];
  for (let number = 1; number <= TOTAL_FORCES; number++) {
    if (!existingNumbers.has(number)) {
      toCreate.push({ number, title: titleFor(number) });
    }
  }

  if (toCreate.length > 0) {
    await prisma.force.createMany({ data: toCreate });
  }

  const withKnownTitle = Object.keys(KNOWN_TITLES).length;
  console.log(`  ${toCreate.length} force(s) créée(s), ${existing.length} déjà présente(s).`);
  console.log(`  ${withKnownTitle} titres confirmés, ${TOTAL_FORCES - withKnownTitle} à renseigner.`);
  console.log("  Les visuels se déposent depuis /admin/forces.");
}

main()
  .catch((err) => {
    console.error("Échec du seed des forces :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
