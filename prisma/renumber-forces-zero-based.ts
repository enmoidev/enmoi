// Renumérotation des forces de 1-100 vers 0-99
//
//   Dev  : npx tsx prisma/renumber-forces-zero-based.ts
//   Prod : npx dotenv -e .env.production -- npx tsx prisma/renumber-forces-zero-based.ts
//
// Le client numérote ses 100 forces **de 0 à 99**. La base a été peuplée de 1 à
// 100 : ce script décale chaque numéro de −1, en conservant l'ordre. La force
// n° 1 devient la n° 0, la n° 100 devient la n° 99.
//
// Les visuels ne bougent pas : leur clé de stockage dérive de l'`id` de la force,
// jamais de son numéro (voir lib/forces/forceAssets.ts). C'est précisément ce qui
// rend cette renumérotation possible en un seul UPDATE par ligne.
//
// ⚠️ Ce script est à passer UNE SEULE FOIS. Il refuse de s'exécuter si la base
// n'est pas exactement dans l'état attendu (100 forces numérotées 1 à 100), ce
// qui le rend sûr à relancer : un second passage ne fait rien.
//
// Passer --dry-run pour voir ce qui serait fait sans rien écrire.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOTAL_FORCES = 100;
const dryRun = process.argv.includes("--dry-run");

async function main() {
  const forces = await prisma.force.findMany({ orderBy: { number: "asc" } });

  const numbers = forces.map((f) => f.number);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  console.log(`${forces.length} forces en base, numérotées de ${min} à ${max}.`);

  if (min === 0 && max === TOTAL_FORCES - 1) {
    console.log("Déjà en 0-99 : rien à faire.");
    return;
  }

  // Garde-fou : on ne décale que depuis l'état 1-100 exact. Toute autre
  // situation (trous, doublons, renumérotation partielle) demande un examen
  // manuel plutôt qu'un décalage aveugle.
  const expected = Array.from({ length: TOTAL_FORCES }, (_, i) => i + 1);
  const isExactlyOneToHundred =
    forces.length === TOTAL_FORCES && numbers.every((n, i) => n === expected[i]);

  if (!isExactlyOneToHundred) {
    throw new Error(
      `État inattendu : ${forces.length} forces numérotées de ${min} à ${max}. ` +
        `Ce script n'accepte que 100 forces numérotées exactement de 1 à 100. ` +
        `Vérifiez la base avant de renuméroter.`
    );
  }

  console.log(
    dryRun
      ? "\n[dry-run] Décalage de −1 qui serait appliqué :"
      : "\nDécalage de −1 sur les 100 forces :"
  );
  console.log(`  ${forces[0].number} → ${forces[0].number - 1}  « ${forces[0].title} »`);
  console.log("  …");
  const last = forces[forces.length - 1];
  console.log(`  ${last.number} → ${last.number - 1}  « ${last.title} »`);

  if (dryRun) return;

  // `number` est unique : décaler ligne à ligne dans l'ordre croissant ne peut
  // pas entrer en collision, puisque la place visée vient d'être libérée. La
  // transaction garantit qu'on ne reste pas à mi-chemin.
  await prisma.$transaction(
    forces.map((force) =>
      prisma.force.update({
        where: { id: force.id },
        data: { number: force.number - 1 },
      })
    )
  );

  const after = await prisma.force.aggregate({
    _min: { number: true },
    _max: { number: true },
  });
  console.log(`\nTerminé : les forces vont désormais de ${after._min.number} à ${after._max.number}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
