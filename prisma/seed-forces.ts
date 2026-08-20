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

/// Les forces sont numérotées **de 0 à 99** (numérotation du client).
export const FIRST_FORCE_NUMBER = 0;
export const LAST_FORCE_NUMBER = FIRST_FORCE_NUMBER + TOTAL_FORCES - 1;

/// Titres confirmés par les visuels livrés par le client, dans l'ordre du lot 1 :
/// la première force livrée porte le numéro 0, la dixième le numéro 9.
/// Les forces absentes de cette table reçoivent un titre provisoire, à corriger
/// depuis le back-office au fur et à mesure des livraisons.
const KNOWN_TITLES: Record<number, string> = {
  0: "La Créative audacieuse",
  1: "La Flamme",
  2: "L'Harmonisatrice",
  3: "La Perfectionniste",
  4: "La Communicante",
  5: "L'Opportuniste ardente",
  6: "La Meneuse",
  7: "L'Intuitive optimiste",
  8: "La Gardienne des valeurs",
  9: "La Bâtisseuse fraternelle",
};

function titleFor(number: number): string {
  return KNOWN_TITLES[number] ?? `Force ${number} — titre à renseigner`;
}

async function main() {
  console.log("Seed des forces...");

  const existing = await prisma.force.findMany({ select: { number: true } });
  const existingNumbers = new Set(existing.map((f) => f.number));

  const toCreate = [];
  for (let number = FIRST_FORCE_NUMBER; number <= LAST_FORCE_NUMBER; number++) {
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
