// prisma/seed-aptitudes.ts
// -------------------------------------------
// Seed script pour insérer 100 Aptitudes avec valeurs par défaut
// Utilisation :
//   Dev :   npx tsx prisma/seed-aptitudes.ts
//   Prod :  npx dotenv -e .env.production -- npx tsx prisma/seed-aptitudes.ts
//
// Ce script est idempotent : il ne recrée pas les aptitudes existantes.
//
// -------------------------------------------

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  console.log("Lancement du seed des aptitudes...");

  // Vérifier si des aptitudes existent déjà
  const existingCount = await prisma.aptitude.count();
  if (existingCount > 0) {
    console.log(`ℹ️  ${existingCount} aptitudes déjà présentes — seed ignoré.`);
    await prisma.$disconnect();
    return;
  }

  // Génération de 100 aptitudes par défaut
  const aptitudesData = Array.from({ length: 100 }, (_, i) => {
    const number = i + 1;
    return {
      number,
      title: `Titre de l'aptitude ${number}`,
      livingDefinition: `Définition de vie pour l'aptitude ${number}`,
      emblematicText: `Texte emblématique pour l'aptitude ${number}`,
      associatedStrengths: [`Force 1 de l'aptitude ${number}`, `Force 2 de l'aptitude ${number}`],
      vigilanceZones: [`Zone de vigilance 1 de l'aptitude ${number}`, `Zone de vigilance 2 de l'aptitude ${number}`],
      keywords: [`Mot-clé 1 de l'aptitude ${number}`, `Mot-clé 2 de l'aptitude ${number}`, `Mot-clé 3 de l'aptitude ${number}`],
    };
  });

  console.log(aptitudesData)

  // Insertion en batch
  await prisma.aptitude.createMany({
    data: aptitudesData,
  });

  console.log(`✅ ${aptitudesData.length} aptitudes créées avec succès.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed des aptitudes :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
