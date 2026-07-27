// Chargement des gabarits de pages d'introduction (public/pdf-design/)
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

import fs from "fs";
import path from "path";

const DESIGN_DIR = path.join(process.cwd(), "public", "pdf-design");

const cache = new Map<string, Buffer>();

/// Pose un gabarit de design en pleine page A4 (sans marge ni recadrage).
/// Les gabarits sont déjà au format A4 : ils couvrent la page exactement.
export function drawFullPageDesign(doc: PDFKit.PDFDocument, filename: string) {
  doc.image(loadDesignAsset(filename), 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
}

export function loadDesignAsset(filename: string): Buffer {
  const cached = cache.get(filename);
  if (cached) return cached;

  const assetPath = path.join(DESIGN_DIR, filename);

  if (!fs.existsSync(assetPath)) {
    throw new Error(
      `Gabarit introuvable : ${filename}. Vérifiez public/pdf-design/ et la ` +
        `configuration outputFileTracingIncludes de next.config.ts.`
    );
  }

  const buffer = fs.readFileSync(assetPath);
  cache.set(filename, buffer);
  return buffer;
}
