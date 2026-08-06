// Import en masse des visuels de forces livrés par le client (dossier `livrable-png`)
//
//   Aperçu (n'écrit rien)  : npx tsx scripts/import-forces.ts
//   Import réel            : npx tsx scripts/import-forces.ts --apply
//   Prod                   : npx dotenv -e .env.production -- npx tsx scripts/import-forces.ts --apply
//
// Fait exactement ce que fait `POST /api/forces/[number]/[page]` — mêmes clés de
// stockage, même validation PNG, même adaptateur — mais sans passer par HTTP.
//
// Idempotent : une force dont les deux visuels sont déjà déposés est ignorée,
// sauf `--overwrite`.

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { getStorage } from "@/lib/storage";
import {
  forceAssetKey,
  validateForceImage,
  TOTAL_FORCES,
  type ForcePage,
} from "@/lib/forces/forceAssets";

const prisma = new PrismaClient();

/// Racine des livraisons du client, relative à la racine du projet.
const DEFAULT_ROOT = path.join("livrable-png", "05 - forces");

/// Correspondance lot → plage de numéros de force.
///
/// Chaque lot du client renumérote ses dossiers à partir de 1 : c'est cette table
/// qui donne le numéro global. Elle est confirmée par les 32 premières forces
/// saisies à la main dans le back-office (lot 2 n° 1 = force 11, lot 3 n° 1 =
/// force 31). Si le client livre un lot supplémentaire ou renumérote, c'est la
/// seule constante à corriger.
const LOTS: { folder: string; firstNumber: number; count: number }[] = [
  { folder: "V6-Lot 1", firstNumber: 1, count: 10 },
  { folder: "V6-Lot 2", firstNumber: 11, count: 20 },
  { folder: "V6-Lot 3", firstNumber: 31, count: 20 },
  { folder: "V6-Lot 4", firstNumber: 51, count: 20 },
  { folder: "V6-Lot 5", firstNumber: 71, count: 20 },
  { folder: "V6-Lot 6", firstNumber: 91, count: 10 },
];

/// Nombre d'uploads menés de front. Le stockage encaisse largement plus, mais
/// au-delà les erreurs deviennent pénibles à rattacher à leur force.
const CONCURRENCY = 4;

/// Coquilles du nommage client, à corriger dans le titre stocké en base.
///
/// Le nom de fichier fait foi pour le titre, sauf ici : ces quatre-là sont des
/// fautes de frappe avérées. Le visuel lui-même, lui, porte le titre correct —
/// c'est bien le nom du fichier qui dérape, pas la force.
const TITLE_FIXES: Record<number, string> = {
  8: "L'Intuitive optimiste", // fichier : « L'Intuituve optimiste »
  89: "La Pragmatique dévouée", // fichier : « La Pragmatique dévouéée »
};

/// Retire le suffixe « (1) » que laisse un téléchargement en double.
/// Contrairement aux coquilles ci-dessus, l'artefact est mécanique et se
/// reproduira à chaque nouvelle livraison : on le nettoie par règle.
function cleanTitle(raw: string): string {
  return raw.replace(/\s*\(\d+\)$/, "").trim();
}

type Options = {
  root: string;
  apply: boolean;
  overwrite: boolean;
  keepTitles: boolean;
  from: number;
  to: number;
};

function parseArgs(argv: string[]): Options {
  const options: Options = {
    root: DEFAULT_ROOT,
    apply: false,
    overwrite: false,
    keepTitles: false,
    from: 1,
    to: TOTAL_FORCES,
  };

  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg === "--overwrite") options.overwrite = true;
    else if (arg === "--keep-titles") options.keepTitles = true;
    else if (arg.startsWith("--root=")) options.root = arg.slice("--root=".length);
    else if (arg.startsWith("--from=")) options.from = Number(arg.slice("--from=".length));
    else if (arg.startsWith("--to=")) options.to = Number(arg.slice("--to=".length));
    else throw new Error(`Option inconnue : ${arg}`);
  }

  if (!Number.isInteger(options.from) || !Number.isInteger(options.to)) {
    throw new Error("--from et --to attendent des entiers.");
  }

  return options;
}

type Delivery = {
  number: number;
  title: string;
  lot: string;
  files: Record<ForcePage, { absolutePath: string; originalName: string }>;
};

/// Repère les deux PNG d'un dossier de force.
///
/// Le client suffixe la page B d'un « 2 » (`La Flamme.png` / `La Flamme2.png`).
/// Le titre vient du nom du fichier de la page A, plus régulier que celui du
/// dossier — lequel porte un préfixe numérique et parfois des tirets parasites
/// (`1-La-Créative audacieuse`).
function readForceFolder(directory: string): {
  title: string;
  files: Delivery["files"];
} {
  const pngs = fs
    .readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith(".png"));

  const pageB = pngs.filter((name) => /2\.png$/i.test(name));
  const pageA = pngs.filter((name) => !/2\.png$/i.test(name));

  if (pageA.length !== 1 || pageB.length !== 1) {
    throw new Error(
      `${directory} : attendu 1 PNG page A et 1 PNG page B, trouvé ` +
        `${pageA.length} et ${pageB.length}.`
    );
  }

  return {
    title: cleanTitle(path.basename(pageA[0], path.extname(pageA[0]))),
    files: {
      a: { absolutePath: path.join(directory, pageA[0]), originalName: pageA[0] },
      b: { absolutePath: path.join(directory, pageB[0]), originalName: pageB[0] },
    },
  };
}

/// Parcourt les lots et attribue son numéro global à chaque force livrée.
function collectDeliveries(root: string): Delivery[] {
  if (!fs.existsSync(root)) {
    throw new Error(`Dossier de livraison introuvable : ${root}`);
  }

  const deliveries: Delivery[] = [];

  for (const lot of LOTS) {
    const lotPath = path.join(root, lot.folder);
    if (!fs.existsSync(lotPath)) {
      throw new Error(`Lot manquant : ${lotPath}`);
    }

    const entries = fs
      .readdirSync(lotPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory());

    const seen = new Map<number, string>();

    for (const entry of entries) {
      // Le préfixe numérique du dossier est le rang dans le lot, pas le numéro
      // de force. Le séparateur varie (`1-`, `10- `, `12 - `).
      const match = /^(\d+)\s*-/.exec(entry.name);
      if (!match) {
        throw new Error(`${path.join(lotPath, entry.name)} : préfixe numérique illisible.`);
      }

      const rank = Number(match[1]);
      if (rank < 1 || rank > lot.count) {
        throw new Error(
          `${entry.name} : rang ${rank} hors des ${lot.count} forces attendues dans ${lot.folder}.`
        );
      }
      if (seen.has(rank)) {
        throw new Error(
          `${lot.folder} : rang ${rank} en double (« ${seen.get(rank)} » et « ${entry.name} »).`
        );
      }
      seen.set(rank, entry.name);

      const { title, files } = readForceFolder(path.join(lotPath, entry.name));
      const number = lot.firstNumber + rank - 1;
      deliveries.push({
        number,
        title: TITLE_FIXES[number] ?? title,
        lot: lot.folder,
        files,
      });
    }

    if (seen.size !== lot.count) {
      const missing = Array.from({ length: lot.count }, (_, i) => i + 1).filter(
        (rank) => !seen.has(rank)
      );
      throw new Error(`${lot.folder} : rangs manquants — ${missing.join(", ")}.`);
    }
  }

  deliveries.sort((left, right) => left.number - right.number);
  return deliveries;
}

/// Lit et valide un PNG avec la même règle que l'upload du back-office.
function readValidatedPng(filePath: string, forceNumber: number, page: ForcePage): Buffer {
  const buffer = fs.readFileSync(filePath);
  const validation = validateForceImage(buffer);
  if (!validation.ok) {
    throw new Error(`Force ${forceNumber} page ${page.toUpperCase()} — ${validation.reason}`);
  }
  return buffer;
}

/// Exécute `worker` sur chaque élément, `limit` en parallèle, en préservant
/// l'ordre des résultats.
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });

  await Promise.all(runners);
  return results;
}

/// Décrit l'environnement visé, sans jamais révéler d'identifiant.
///
/// Le script s'exécute indifféremment sur le dev ou la production selon le
/// fichier d'environnement chargé : afficher la cible évite d'écrire dans le
/// mauvais bucket en croyant faire l'autre.
function describeTarget(): string {
  const bucket = process.env.S3_BUCKET ?? "(aucun — stockage local .storage/)";

  let database = "(DATABASE_URL absente)";
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    database = `${url.hostname}${url.pathname}`;
  } catch {
    // URL illisible : Prisma échouera de toute façon avec un message plus clair.
  }

  return `bucket « ${bucket} » — base ${database}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log(`Cible : ${describeTarget()}`);
  const deliveries = collectDeliveries(options.root).filter(
    (delivery) => delivery.number >= options.from && delivery.number <= options.to
  );

  console.log(`Livraisons lues : ${deliveries.length} force(s) dans ${options.root}`);

  const existing = await prisma.force.findMany({
    where: { number: { in: deliveries.map((delivery) => delivery.number) } },
  });
  const byNumber = new Map(existing.map((force) => [force.number, force]));

  const missingRows = deliveries.filter((delivery) => !byNumber.has(delivery.number));
  if (missingRows.length > 0) {
    throw new Error(
      `Ces forces n'existent pas en base : ${missingRows.map((d) => d.number).join(", ")}. ` +
        `Lancez d'abord « npx tsx prisma/seed-forces.ts ».`
    );
  }

  const toUpload = deliveries.filter((delivery) => {
    const force = byNumber.get(delivery.number)!;
    return options.overwrite || !force.pageAKey || !force.pageBKey;
  });
  const skipped = deliveries.length - toUpload.length;

  const titleChanges = options.keepTitles
    ? []
    : deliveries.filter((delivery) => byNumber.get(delivery.number)!.title !== delivery.title);

  console.log(`  ${toUpload.length} à importer, ${skipped} déjà complète(s) et ignorée(s).`);
  console.log(`  ${titleChanges.length} titre(s) à corriger.`);

  if (titleChanges.length > 0) {
    for (const delivery of titleChanges) {
      console.log(
        `    ${delivery.number} : « ${byNumber.get(delivery.number)!.title} » → « ${delivery.title} »`
      );
    }
  }

  if (!options.apply) {
    console.log("\nAperçu seulement — relancez avec --apply pour écrire.");
    if (toUpload.length > 0) {
      const preview = toUpload.slice(0, 5);
      console.log("Premiers imports prévus :");
      for (const delivery of preview) {
        const id = byNumber.get(delivery.number)!.id;
        console.log(
          `  ${delivery.number} | ${delivery.title} | ${delivery.lot} | ` +
            `${forceAssetKey(id, "a")} + ${forceAssetKey(id, "b")}`
        );
      }
      if (toUpload.length > preview.length) {
        console.log(`  … et ${toUpload.length - preview.length} autre(s).`);
      }
    }
    return;
  }

  const storage = getStorage();
  const failures: string[] = [];
  let done = 0;

  await mapWithLimit(toUpload, CONCURRENCY, async (delivery) => {
    try {
      // On valide les deux pages avant d'écrire quoi que ce soit : jamais de
      // force à moitié importée en cas de PNG invalide.
      const buffers: Record<ForcePage, Buffer> = {
        a: readValidatedPng(delivery.files.a.absolutePath, delivery.number, "a"),
        b: readValidatedPng(delivery.files.b.absolutePath, delivery.number, "b"),
      };

      const force = byNumber.get(delivery.number)!;
      const keyA = forceAssetKey(force.id, "a");
      const keyB = forceAssetKey(force.id, "b");

      await storage.put(keyA, buffers.a, "image/png");
      await storage.put(keyB, buffers.b, "image/png");

      await prisma.force.update({
        where: { id: force.id },
        data: {
          pageAKey: keyA,
          pageBKey: keyB,
          pageAFilename: delivery.files.a.originalName,
          pageBFilename: delivery.files.b.originalName,
          ...(options.keepTitles ? {} : { title: delivery.title }),
        },
      });

      done++;
      console.log(`  [${done}/${toUpload.length}] force ${delivery.number} — ${delivery.title}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`force ${delivery.number} (${delivery.title}) : ${message}`);
    }
  });

  // Les forces déjà complètes ont été écartées de l'upload, mais leur titre peut
  // encore diverger du nom de fichier livré, qui fait foi.
  if (!options.keepTitles) {
    const pending = titleChanges.filter(
      (delivery) => !toUpload.some((item) => item.number === delivery.number)
    );
    for (const delivery of pending) {
      await prisma.force.update({
        where: { id: byNumber.get(delivery.number)!.id },
        data: { title: delivery.title },
      });
    }
    if (pending.length > 0) {
      console.log(`  ${pending.length} titre(s) corrigé(s) sur des forces déjà complètes.`);
    }
  }

  console.log(`\nImport terminé : ${done} force(s) importée(s), ${failures.length} en échec.`);
  if (failures.length > 0) {
    console.error("Échecs :");
    for (const failure of failures) console.error(`  ${failure}`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("Échec de l'import des forces :", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
