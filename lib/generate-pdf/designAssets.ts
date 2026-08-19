// Chargement des gabarits de pages (public/pdf-design/)
//
// Ces visuels sont versionnés dans le dépôt — contrairement aux visuels de
// forces, déposés par le client et stockés sur S3. Ils sont lus sur le disque,
// y compris en production : `public/` est en lecture seule sur Vercel mais reste
// lisible dès lors que les fichiers sont inclus dans la trace de la fonction
// (outputFileTracingIncludes dans next.config.ts).
//
// L'implémentation précédente les téléchargeait en HTTP depuis le site déployé,
// ce qui ajoutait un aller-retour réseau par image et faisait dépendre la
// génération du PDF de la disponibilité du site lui-même.
//
// Les gabarits sont rangés par livrable : public/pdf-design/<livrable>/<page>.png
// (voir lib/generate-pdf/deliverables.ts). Le dossier `hors-livrable/` réunit
// les visuels fournis par le client qui n'appartiennent à aucun des trois
// documents (fiche explicative, schémas) : ils ne sont pas assemblés ici.

import fs from "fs";
import path from "path";

const DESIGN_DIR = path.join(process.cwd(), "public", "pdf-design");

const cache = new Map<string, Buffer>();

/// Pose un gabarit en pleine page A4 (sans marge ni recadrage).
/// Les gabarits sont déjà au format A4 : ils couvrent la page exactement.
export function drawFullPageDesign(doc: PDFKit.PDFDocument, asset: string) {
  doc.image(loadDesignAsset(asset), 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
}

/// Charge un gabarit désigné par son chemin relatif à public/pdf-design/.
export function loadDesignAsset(asset: string): Buffer {
  const cached = cache.get(asset);
  if (cached) return cached;

  const assetPath = path.join(DESIGN_DIR, asset);

  if (!fs.existsSync(assetPath)) {
    throw new Error(
      `Gabarit introuvable : ${asset}. Vérifiez public/pdf-design/ et la ` +
        `configuration outputFileTracingIncludes de next.config.ts.`
    );
  }

  const buffer = fs.readFileSync(assetPath);
  cache.set(asset, buffer);
  return buffer;
}
