// Coordonnées de surimpression sur les visuels de forces
//
// TOUTES les positions du PDF se règlent ici. Les gabarits sont réédités par le
// client : quand une zone se décale, on ajuste une constante de ce fichier et
// rien d'autre.
//
// Les valeurs sont exprimées en **pixels du visuel source** (A4 à 300 DPI,
// 2480 × 3508 px), ce qui permet de les relever directement dans un éditeur
// d'image. La conversion vers les points PDF est faite par pxToPt().

/// Dimensions des visuels fournis par le client.
export const SOURCE_WIDTH_PX = 2480;
export const SOURCE_HEIGHT_PX = 3508;

/// Dimensions d'une page A4 en points PDF (unité de pdfkit).
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;

const PX_TO_PT = A4_WIDTH_PT / SOURCE_WIDTH_PX;

/// Convertit une mesure du visuel source en points PDF.
export function pxToPt(px: number): number {
  return px * PX_TO_PT;
}

/// Blanc du bandeau turquoise — le prénom doit s'y fondre avec les autres
/// éléments de l'en-tête (logo, « Étape 1 »).
export const HEADER_TEXT_COLOR = "#ffffff";

export type TextBox = {
  /// Coin haut-gauche de la zone, en pixels du visuel source.
  xPx: number;
  yPx: number;
  /// Largeur disponible. Au-delà, la police est réduite automatiquement.
  maxWidthPx: number;
  fontSizePt: number;
  minFontSizePt: number;
  font: string;
  color: string;
};

/// Page A — prénom de la personne, en haut à gauche du bandeau turquoise.
/// Le logo est centré et « Étape 1 » occupe la droite : la zone gauche est libre.
export const PAGE_A_FIRST_NAME: TextBox = {
  xPx: 193,
  yPx: 152,
  maxWidthPx: 700,
  fontSizePt: 18,
  minFontSizePt: 11,
  font: "boldPhilosopher",
  color: HEADER_TEXT_COLOR,
};

/// Page B — position de la force (1 à 7), dans le blanc de « Force ___ /7 : ».
/// ⚠️ C'est la position dans les 7, jamais le numéro de la force sur 100.
export const PAGE_B_POSITION: TextBox = {
  xPx: 376,
  yPx: 652,
  maxWidthPx: 90,
  fontSizePt: 17,
  minFontSizePt: 12,
  font: "boldPhilosopher",
  color: HEADER_TEXT_COLOR,
};

/// Page B — rôle symbolique, à droite du libellé « Son rôle : ».
export const PAGE_B_SYMBOLIC_ROLE: TextBox = {
  xPx: 500,
  yPx: 842,
  maxWidthPx: 1700,
  fontSizePt: 17,
  minFontSizePt: 11,
  font: "boldPhilosopher",
  color: HEADER_TEXT_COLOR,
};
