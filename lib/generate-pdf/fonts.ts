// Chargement des polices du PMI depuis le bundle de déploiement
//
// Les polices sont lues sur le disque, y compris en production : `public/` est en
// lecture seule sur Vercel mais reste lisible, à condition que les fichiers soient
// inclus dans la trace de la fonction (voir outputFileTracingIncludes dans
// next.config.ts). L'ancienne implémentation les récupérait en HTTP sur le site
// déployé, ce qui ajoutait un aller-retour réseau par document.

import fs from "fs";
import path from "path";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

/// Nom logique -> fichier. Les noms logiques sont ceux passés à doc.font().
const FONT_FILES: Readonly<Record<string, string>> = {
  regularAktiv: "AktivGrotesk-Regular.ttf",
  mediumAktiv: "AktivGrotesk-Medium.ttf",
  mediumItalicAktiv: "AktivGrotesk-MediumItalic.ttf",
  semiboldAktiv: "AktivGrotesk-SemiBold.ttf",
  boldAktiv: "AktivGrotesk-XBold.ttf",
  boldItalicAktiv: "AktivGrotesk-XBoldItalic.ttf",
  italicAktiv: "AktivGrotesk-Italic.ttf",
  boldPhilosopher: "Philosopher-Bold.ttf",
  rosaliaRegular: "Rosalia.otf",
};

export const DEFAULT_FONT_PATH = path.join(FONT_DIR, FONT_FILES.regularAktiv);

/// Enregistre toutes les polices auprès du document.
export function registerFonts(doc: PDFKit.PDFDocument) {
  for (const [name, file] of Object.entries(FONT_FILES)) {
    const fontPath = path.join(FONT_DIR, file);
    if (!fs.existsSync(fontPath)) {
      throw new Error(
        `Police introuvable : ${file}. Vérifiez public/fonts/ et la configuration ` +
          `outputFileTracingIncludes de next.config.ts.`
      );
    }
    doc.registerFont(name, fontPath);
  }
}
