// Chargement des polices du livrable depuis le bundle de déploiement
//
// Les polices sont lues sur le disque, y compris en production : `public/` est en
// lecture seule sur Vercel mais reste lisible, à condition que les fichiers soient
// inclus dans la trace de la fonction (voir outputFileTracingIncludes dans
// next.config.ts). L'ancienne implémentation les récupérait en HTTP sur le site
// déployé, ce qui ajoutait un aller-retour réseau par document.
//
// Charte typographique fournie par le client (juillet 2026) :
//   - Gabriola : le prénom manuscrit du client, sur le bandeau
//   - Georgia / Georgia Bold : titres, numéro et rôle de la force
//   - Cabin Regular / Bold : textes courants

import fs from "fs";
import path from "path";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

// Nom logique -> fichier. Les noms logiques sont ceux passés à doc.font().
//
// Les entrées « alias » (Aktiv / Philosopher / Rosalia) pointent vers les
// nouvelles polices : elles évitent de réécrire les pages d'introduction, qui
// référencent encore les anciens noms. Le rendu suit la nouvelle charte.
const FONT_FILES: Readonly<Record<string, string>> = {
  // Charte courante
  gabriola: "Gabriola.ttf",
  georgia: "georgia.ttf",
  georgiaBold: "georgiab.ttf",
  cabin: "Cabin-Regular.ttf",
  cabinBold: "Cabin-Bold.ttf",

  // Alias hérités -> nouvelles polices
  rosaliaRegular: "Gabriola.ttf",
  boldPhilosopher: "georgiab.ttf",
  regularAktiv: "Cabin-Regular.ttf",
  mediumAktiv: "Cabin-Regular.ttf",
  semiboldAktiv: "Cabin-Bold.ttf",
  boldAktiv: "Cabin-Bold.ttf",
  // Cabin ne fournit pas d'italique : on retombe sur le romain, faute de mieux.
  italicAktiv: "Cabin-Regular.ttf",
  mediumItalicAktiv: "Cabin-Regular.ttf",
  boldItalicAktiv: "Cabin-Bold.ttf",
};

export const DEFAULT_FONT_PATH = path.join(FONT_DIR, "Cabin-Regular.ttf");

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
