// Migre les visuels de forces vers des clés indexées sur l'identifiant
//
//   Aperçu (n'écrit rien)  : npx tsx scripts/migrate-force-keys.ts
//   Migration réelle       : npx tsx scripts/migrate-force-keys.ts --apply
//   Prod                   : npx dotenv-cli -e .env.production -- npx tsx scripts/migrate-force-keys.ts --apply
//
// Les clés dérivaient du numéro de force (`forces/38/a.png`). Ce numéro étant
// désormais réattribuable depuis la médiathèque, il ne peut plus servir
// d'identifiant de stockage : les clés passent à `forces/{id}/{page}.png`.
//
// À usage unique, mais relançable sans risque : une force déjà migrée est
// ignorée. L'ancien objet n'est supprimé qu'après vérification que le nouveau
// est bien lisible — en cas d'interruption, on perd au pire un doublon, jamais
// un visuel.

import { PrismaClient } from "@prisma/client";
import { getStorage } from "@/lib/storage";
import { forceAssetKey, FORCE_PAGES, type ForcePage } from "@/lib/forces/forceAssets";

const prisma = new PrismaClient();

type Move = {
  forceId: string;
  number: number;
  title: string;
  page: ForcePage;
  from: string;
  to: string;
};

function describeTarget(): string {
  const bucket = process.env.S3_BUCKET ?? "(aucun — stockage local .storage/)";
  let database = "(DATABASE_URL absente)";
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    database = `${url.hostname}${url.pathname}`;
  } catch {
    // Prisma produira un message plus clair que celui qu'on écrirait ici.
  }
  return `bucket « ${bucket} » — base ${database}`;
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(`Cible : ${describeTarget()}`);

  const forces = await prisma.force.findMany({ orderBy: { number: "asc" } });
  const moves: Move[] = [];

  for (const force of forces) {
    for (const page of FORCE_PAGES) {
      const current = page === "a" ? force.pageAKey : force.pageBKey;
      if (!current) continue;

      const expected = forceAssetKey(force.id, page);
      if (current === expected) continue;

      moves.push({
        forceId: force.id,
        number: force.number,
        title: force.title,
        page,
        from: current,
        to: expected,
      });
    }
  }

  console.log(`  ${moves.length} visuel(s) à déplacer sur ${forces.length} force(s).`);

  if (moves.length === 0) {
    console.log("  Rien à faire : toutes les clés sont déjà indexées sur l'identifiant.");
    return;
  }

  if (!apply) {
    for (const move of moves.slice(0, 4)) {
      console.log(`    ${move.number} ${move.title} : ${move.from} → ${move.to}`);
    }
    if (moves.length > 4) console.log(`    … et ${moves.length - 4} autre(s).`);
    console.log("\nAperçu seulement — relancez avec --apply pour écrire.");
    return;
  }

  const storage = getStorage();
  const failures: string[] = [];
  let done = 0;

  for (const move of moves) {
    try {
      const buffer = await storage.getBuffer(move.from);
      await storage.put(move.to, buffer, "image/png");

      // On ne bascule la base qu'une fois le nouvel objet écrit, et on ne
      // supprime l'ancien qu'une fois la base à jour : à chaque instant, la clé
      // enregistrée désigne un objet qui existe.
      const column = move.page === "a" ? "pageAKey" : "pageBKey";
      await prisma.force.update({
        where: { id: move.forceId },
        data: { [column]: move.to },
      });

      await storage.remove(move.from);

      done++;
      console.log(`  [${done}/${moves.length}] ${move.number} ${move.title} — page ${move.page.toUpperCase()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${move.number} ${move.title} page ${move.page.toUpperCase()} : ${message}`);
    }
  }

  console.log(`\nMigration terminée : ${done} déplacé(s), ${failures.length} en échec.`);
  if (failures.length > 0) {
    console.error("Échecs :");
    for (const failure of failures) console.error(`  ${failure}`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("Échec de la migration :", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
