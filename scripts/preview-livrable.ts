// Aperçu d'un livrable avec des données factices, sans base ni S3
//
// Sert à caler les surimpressions : on génère le document, on l'ouvre, on
// compare avec la maquette du client, puis on ajuste overlayLayout.ts. C'est la
// méthode retenue par le projet — vérifier à l'œil sur le gabarit réel plutôt
// que deviner des coordonnées.
//
//   npx tsx scripts/preview-livrable.ts freemium
//   npx tsx scripts/preview-livrable.ts livrable2 apercu.pdf
//
// Les fiches de forces sont remplacées par des pages blanches, puisqu'elles
// viennent de S3. Pour caler aussi leurs surimpressions (prénom, grand chiffre,
// position, rôle), passer un dossier contenant les deux PNG d'une fiche via
// FICHE : le premier par ordre alphabétique sert de page A, le second de page B.
//
//   FICHE="livrable-png/05 - forces/V6-Lot 1/1-La-Créative audacieuse" \
//     npx tsx scripts/preview-livrable.ts livrable1

import fs from "fs";
import path from "path";
import { generatePdf } from "@/lib/generate-pdf/generatePdf";
import { DELIVERABLES, pageCount } from "@/lib/generate-pdf/deliverables";
import { FORCE_ROLES, roleOverlayText } from "@/lib/forces/roles";
import type { DeliverableId, PdfData } from "@/types/pdf";

/// Les 7 titres de l'exemple fourni par le client, dans l'ordre des positions.
/// Les reprendre permet de comparer l'aperçu à sa maquette page par page.
const SAMPLE_TITLES = [
  "La Communicante",
  "La Flamme",
  "L'Harmonisatrice",
  "La Perfectionniste",
  "La Créative audacieuse",
  "L'Opportuniste ardente",
  "La Meneuse",
];

/// Page A4 blanche à 300 DPI, en guise de fiche de force.
/// PNG minimal écrit à la main : une image 1 × 1 blanche, que pdfkit étire sur
/// toute la page. Évite d'ajouter une dépendance juste pour l'aperçu.
const BLANK_PAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "base64"
);

/// Les deux visuels d'une vraie fiche, si FICHE désigne un dossier qui en contient.
function realSheet(): { pageA: Buffer; pageB: Buffer } | null {
  const dir = process.env.FICHE;
  if (!dir) return null;

  const pngs = fs
    .readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith(".png"))
    .sort();

  if (pngs.length < 2) {
    throw new Error(`FICHE doit contenir deux PNG ; ${pngs.length} trouvé(s) dans ${dir}.`);
  }

  return {
    pageA: fs.readFileSync(path.join(dir, pngs[0])),
    pageB: fs.readFileSync(path.join(dir, pngs[1])),
  };
}

async function main() {
  const [id, output] = process.argv.slice(2);

  if (!id || !(id in DELIVERABLES)) {
    console.error(
      `Usage : npx tsx scripts/preview-livrable.ts <${Object.keys(DELIVERABLES).join("|")}> [sortie.pdf]`
    );
    process.exit(1);
  }

  const deliverableId = id as DeliverableId;
  const deliverable = DELIVERABLES[deliverableId];
  const sheet = realSheet() ?? { pageA: BLANK_PAGE, pageB: BLANK_PAGE };

  const data: PdfData = {
    deliverable: deliverableId,
    firstName: "Sébastien",
    lastName: "Petit",
    birthPlace: "Marseille",
    birthDate: "1993-07-04",
    // HEURE="" pour vérifier le rendu sans heure de naissance.
    birthTime: process.env.HEURE ?? "14:25",
    forces: FORCE_ROLES.map((_, index) => ({
      number: index + 1,
      title: SAMPLE_TITLES[index],
      position: index + 1,
      symbolicRole: roleOverlayText(index + 1),
      sheet: index < deliverable.detailedForceCount ? sheet : undefined,
    })),
  };

  const buffer = await generatePdf(data);
  const target = path.resolve(output ?? `apercu-${deliverableId}.pdf`);
  fs.writeFileSync(target, buffer);

  console.log(
    `${deliverable.label} : ${pageCount(deliverable)} pages, ` +
      `${(buffer.length / 1024 / 1024).toFixed(1)} Mo -> ${target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
