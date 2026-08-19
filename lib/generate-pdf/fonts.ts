// Chargement des polices du livrable depuis le bundle de déploiement
//
// Les polices sont lues sur le disque, y compris en production : `public/` est en
// lecture seule sur Vercel mais reste lisible, à condition que les fichiers soient
// inclus dans la trace de la fonction (voir outputFileTracingIncludes dans
// next.config.ts). L'ancienne implémentation les récupérait en HTTP sur le site
// déployé, ce qui ajoutait un aller-retour réseau par document.
//
// Charte typographique fournie par le client (note du 05/08/2026) :
//
//   Fiche de force, recto  — prénom  : Gabriola Regular 23, blanc
//                          — chiffre : Book Antiqua Regular 105, gris CCCCCC
//   Fiche de force, verso  — chiffre : Segoe UI SemiBold 13, blanc
//                          — rôle    : Georgia Bold 10,5, blanc
//   Couverture             — prénom  : Cabin SemiBold 20, blanc
//                          — naissance : Cabin Medium 14, blanc
//   Page 3 (roue)          — prénom  : Gabriola Regular 19, noir
//                          — forces  : Cabin Bold 10, noir
//   Pages 5 et 21          — prénom  : Gabriola Regular 19, noir
//
// ⚠️ Gabriola, Georgia, Book Antiqua et Segoe UI sont des polices Microsoft /
// Monotype : leur licence ne couvre pas la redistribution dans une application
// web ni l'incorporation dans un document diffusé commercialement. Le client les
// a imposées et les trois premières étaient déjà en place ; c'est une question
// à régler avant la mise en production (licence, ou substituts libres
// métriquement proches). Cabin est sous OFL, aucune restriction.

import fs from "fs";
import path from "path";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

// Nom logique -> fichier. Les noms logiques sont ceux passés à doc.font().
const FONT_FILES: Readonly<Record<string, string>> = {
  gabriola: "Gabriola.ttf",
  georgia: "georgia.ttf",
  georgiaBold: "georgiab.ttf",
  bookAntiqua: "BookAntiqua-Regular.ttf",
  segoeUiSemiBold: "SegoeUI-SemiBold.ttf",
  cabin: "Cabin-Regular.ttf",
  cabinMedium: "Cabin-Medium.ttf",
  cabinSemiBold: "Cabin-SemiBold.ttf",
  cabinBold: "Cabin-Bold.ttf",
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
