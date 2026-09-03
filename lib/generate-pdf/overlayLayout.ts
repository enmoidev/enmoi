// Coordonnées de surimpression sur les gabarits du livrable
//
// TOUTES les positions du PDF se règlent ici. Les gabarits sont réédités par le
// client : quand une zone se décale, on ajuste une constante de ce fichier et
// rien d'autre.
//
// Les valeurs sont exprimées en **pixels du visuel source** (A4 à 300 DPI,
// 2480 × 3508 px), ce qui permet de les relever directement dans un éditeur
// d'image. La conversion vers les points PDF est faite par pxToPt().
//
// Les valeurs des pages d'introduction ont été relevées dans les PDF de
// référence du client (positions des textes et filets des tableaux), puis
// recoupées sur les PNG livrés. Elles sont donc calées sur la maquette, pas
// estimées à l'œil.

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

/// Blanc du bandeau turquoise — le texte doit s'y fondre avec les autres
/// éléments de l'en-tête (logo, « Étape 1 »).
export const HEADER_TEXT_COLOR = "#ffffff";

/// Noir des textes posés sur fond clair (pastilles ocre de la roue, bandeau
/// ocre des pages 5 et 21). Imposé par le client dans sa note du 05/08/2026.
export const INK_COLOR = "#000000";

/// Gris du grand chiffre de la fiche de force, page A. Idem.
export const FORCE_NUMBER_COLOR = "#cccccc";

/// Où `yPx` place le texte.
///   - `top`      : bord haut de la ligne, comportement par défaut de pdfkit.
///   - `baseline` : ligne de base des lettres.
/// Les deux coexistent volontairement : les fiches de forces ont été calées en
/// `top` et validées ainsi, tandis que les pages d'introduction ont été relevées
/// dans les PDF du client, qui donnent des lignes de base. Convertir les
/// premières ferait perdre un calage déjà éprouvé sans rien apporter.
export type VerticalAnchor = "top" | "baseline";

export type TextBox = {
  /// Bord gauche de la zone, ou son centre si `align` vaut `center`.
  xPx: number;
  yPx: number;
  anchor: VerticalAnchor;
  /// Largeur disponible. Au-delà, la police est réduite automatiquement.
  maxWidthPx: number;
  fontSizePt: number;
  minFontSizePt: number;
  font: string;
  color: string;
  /// Défaut : `left`.
  align?: "left" | "center";
};

// ---------------------------------------------------------------------------
// Fiches de forces (2 pages par force)
// ---------------------------------------------------------------------------

// Polices, tailles et couleurs imposées par le client (note du 05/08/2026).
// Les tailles sont exprimées en points PDF (unité de pdfkit) : elles correspondent
// directement aux tailles de la maquette A4 du client, le point étant une unité
// physique indépendante de la résolution.
//
// Les positions du prénom et du grand chiffre sont relevées dans le fichier
// d'exemple joint à cette note (« Infos pour Sébastien Livrable EnMoi »), qui
// montre la même fiche avec les 7 chiffres possibles.

/// Page A — prénom de la personne, en haut à gauche du bandeau turquoise.
/// Le logo est centré et « Étape 1 » occupe la droite : la zone gauche est libre.
export const PAGE_A_FIRST_NAME: TextBox = {
  xPx: 154,
  yPx: 215,
  anchor: "baseline",
  maxWidthPx: 700,
  fontSizePt: 23,
  minFontSizePt: 14,
  font: "gabriola",
  color: HEADER_TEXT_COLOR,
};

/// Page A — position de la force (1 à 7) en grand, en bas de page.
/// Centrée dans la largeur, ligne de base à 25 mm du bord inférieur.
/// ⚠️ C'est la position dans les 7, jamais le numéro de la force (0 à 99).
export const PAGE_A_FORCE_POSITION: TextBox = {
  xPx: SOURCE_WIDTH_PX / 2,
  yPx: 3202,
  anchor: "baseline",
  // Un seul chiffre : la largeur ne sert qu'au centrage, jamais à réduire.
  maxWidthPx: 400,
  fontSizePt: 105,
  minFontSizePt: 105,
  font: "bookAntiqua",
  color: FORCE_NUMBER_COLOR,
  align: "center",
};

// La page B ne reçoit pas le prénom : son bandeau reprend celui de la page A,
// mais le répéter à une page d'intervalle est redondant (décision client).

/// Page B — position de la force, centrée dans le blanc de « Force ___ /7 : ».
/// Le « Force » gravé s'arrête à 353 px et le « /7 » reprend à 427 px : le
/// chiffre se centre entre les deux, sur la ligne de base du libellé (650 px).
export const PAGE_B_POSITION: TextBox = {
  xPx: 390,
  yPx: 650,
  anchor: "baseline",
  maxWidthPx: 74,
  fontSizePt: 13,
  minFontSizePt: 10,
  font: "segoeUiSemiBold",
  color: HEADER_TEXT_COLOR,
  align: "center",
};

/// Page B — rôle symbolique, à droite du libellé « Son rôle : », qui s'arrête à
/// 458 px. Le texte « Nom - Description » court sur une ligne jusqu'au bord droit
/// du bandeau, sur la ligne de base du libellé (845 px). La police se réduit pour
/// les rôles les plus longs.
export const PAGE_B_SYMBOLIC_ROLE: TextBox = {
  xPx: 470,
  yPx: 845,
  anchor: "baseline",
  maxWidthPx: 1988,
  fontSizePt: 10.5,
  minFontSizePt: 8,
  font: "georgiaBold",
  color: HEADER_TEXT_COLOR,
};

// ---------------------------------------------------------------------------
// Page 1 — couverture
// ---------------------------------------------------------------------------

// Le gabarit ne porte plus que les deux libellés, suivis d'un espace libre :
//   « Je suis : »
//   « Né(e) le : »
// Le « (prénom) » qui suivait « Je suis » a disparu du gabarit le 03/09/2026 :
// la valeur qu'on y pose le dit déjà. Le libellé s'en trouve raccourci de
// 275 px, d'où le recalage du point de départ du prénom.
// Le client a retiré le « à ______ (heure de naissance, si connue)* » qui suivait
// la date : l'heure est désormais composée avec elle, et n'apparaît que si elle
// est connue. Les valeurs se posent donc à la suite de leur libellé, alignées à
// gauche, plutôt que centrées dans un blanc de largeur fixe.
//
// Les trois couvertures partagent la même géométrie à deux pixels près ; on garde
// une entrée par livrable pour pouvoir en recaler une seule si le client réédite.

export type CoverLayout = {
  firstName: TextBox;
  /// Date de naissance, suivie de l'heure quand elle est connue.
  birthLine: TextBox;
};

/// Fabrique une couverture à partir des deux mesures qui changent d'un livrable
/// à l'autre : le point où commence la valeur, juste après chaque libellé gravé.
function coverLayout(firstNameXPx: number, birthLineXPx: number): CoverLayout {
  return {
    firstName: {
      xPx: firstNameXPx,
      yPx: 1237,
      anchor: "baseline",
      maxWidthPx: 1600,
      fontSizePt: 20,
      minFontSizePt: 12,
      font: "cabinSemiBold",
      color: HEADER_TEXT_COLOR,
    },
    birthLine: {
      xPx: birthLineXPx,
      yPx: 1333,
      anchor: "baseline",
      // Jusqu'au bord droit du bandeau : « 04.07.1993 à 14h25* » y tient
      // largement, la réduction de police ne servira qu'en cas de surprise.
      maxWidthPx: 1900,
      fontSizePt: 14,
      minFontSizePt: 10,
      font: "cabinMedium",
      color: HEADER_TEXT_COLOR,
    },
  };
}

// Relevés sur les gabarits : bord droit de « Je suis : » puis de « Né(e) le : »,
// plus une chasse d'espace de 17 px.
export const COVER_LAYOUTS = {
  freemium: coverLayout(491, 532),
  livrable1: coverLayout(489, 530),
  livrable2: coverLayout(491, 532),
} as const;

// ---------------------------------------------------------------------------
// Page 3 — roue « Ma personnalité innée »
// ---------------------------------------------------------------------------

// Le gabarit dessine sept pastilles ocre disposées en couronne, chacune portant
// déjà le nom du rôle (« Ma Déterminante », « Ma Conseillère »…). Le titre de la
// force vient au-dessus, dans la moitié haute de la pastille. Les centres ont
// été relevés par détection des pastilles dans le PNG ; les lignes de base
// viennent du PDF de référence. Les trois livrables partagent cette géométrie
// à trois pixels près, donc une seule table.

/// Index 0 = position 1. L'ordre suit celui des rôles (lib/forces/roles.ts).
export const WHEEL_FORCE_TITLES: readonly TextBox[] = [
  { xPx: 1281, yPx: 1038 }, // 1 — Ma déterminante, pastille du haut
  { xPx: 1898, yPx: 1274 }, // 2 — Ma conseillère
  { xPx: 1921, yPx: 1654 }, // 3 — Ma destination
  { xPx: 1768, yPx: 1959 }, // 4 — Ma stimulante
  { xPx: 835, yPx: 1958 }, // 5 — Ma relationnelle
  { xPx: 567, yPx: 1654 }, // 6 — Ma générationnelle
  { xPx: 647, yPx: 1273 }, // 7 — Mon inspiratrice
].map(({ xPx, yPx }) => ({
  xPx,
  yPx,
  anchor: "baseline" as const,
  // Les pastilles font 505 à 519 px de large : on garde une marge intérieure.
  maxWidthPx: 480,
  fontSizePt: 10,
  minFontSizePt: 7,
  font: "cabinBold",
  color: INK_COLOR,
  align: "center" as const,
}));

/// Prénom au centre du disque, juste au-dessus de « Mes 7 Forces Mentales ».
export const WHEEL_FIRST_NAME: TextBox = {
  xPx: 1281,
  yPx: 1527,
  anchor: "baseline",
  maxWidthPx: 520,
  fontSizePt: 19,
  minFontSizePt: 12,
  font: "gabriola",
  color: INK_COLOR,
  align: "center",
};

// ---------------------------------------------------------------------------
// Pages à bandeau ocre — citation (5) et guide / auto-bilan (9 ou 21)
// ---------------------------------------------------------------------------

/// Prénom seul, en haut à gauche du bandeau ocre.
///
/// Le client vise « les pages 5 et 21 » : la citation, et le guide / auto-bilan
/// — page 21 dans le livrable 2, page 9 dans le freemium, où c'est le même
/// gabarit. Les deux bandeaux ont la même géométrie, d'où une seule zone.
export const OCHRE_BAND_FIRST_NAME: TextBox = {
  xPx: 207,
  yPx: 162,
  anchor: "baseline",
  maxWidthPx: 900,
  fontSizePt: 19,
  minFontSizePt: 12,
  font: "gabriola",
  color: INK_COLOR,
};

/// Livrable 1, page 21 — « Mon évolution ».
///
/// Même bandeau ocre, même position : seule la largeur disponible change. Le
/// titre « Mon évolution » est gravé au milieu du bandeau, de 921 à 1551 px ;
/// la zone du prénom s'arrête donc avant lui, au lieu de courir sur 900 px.
export const MON_EVOLUTION_FIRST_NAME: TextBox = {
  ...OCHRE_BAND_FIRST_NAME,
  maxWidthPx: 640,
};

// ---------------------------------------------------------------------------
// Livrable 2 — tableaux de travail (pages 27, 34 et 35)
// ---------------------------------------------------------------------------

// Ces trois pages sont des tableaux à remplir par la personne. Le livrable y
// pré-remplit le prénom et la colonne « Mes Forces Mentales » ; tout le reste se
// remplit à la main. Les centres de colonne viennent de la détection des filets
// verticaux dans les PNG, les lignes de base du PDF de référence.
//
// La ligne « Date : » reste volontairement vide : elle date la séance de travail,
// pas le document. La personne peut imprimer sa feuille des mois après la
// génération, et la remplir en plusieurs fois — une date imprimée serait fausse.

/// Rectangle plein posé avant le texte, pour neutraliser une zone du gabarit.
export type MaskBox = {
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
  color: string;
};

export type WorksheetLayout = {
  /// Le prénom, posé sur le filet qui suit le libellé « Mon Prénom : ».
  firstName: TextBox;
  /// Les 7 lignes de la colonne « Mes Forces Mentales », dans l'ordre des positions.
  forceTitles: readonly TextBox[];
  /// Les titres sont-ils imprimés en capitales, comme sur l'exemple du client ?
  uppercase: boolean;
  /// Zones du gabarit à recouvrir avant d'écrire. Voir WORKSHEET_EVALUATION.
  masks?: readonly MaskBox[];
};

/// Champ « Mon Prénom : » d'un tableau de travail.
///
/// Les trois gabarits gravent le libellé puis un filet à compléter. Le prénom se
/// pose sur ce filet : le document se lit alors comme un formulaire déjà rempli,
/// et non comme une ligne rajoutée par-dessus.
///
/// Les bornes du filet et la ligne de base du libellé ont été relevées dans les
/// PNG (détection du trait horizontal, puis du bas du « M » de « Mon »). Le
/// Le prénom reprend la typographie qu'il a partout ailleurs dans le livrable —
/// Gabriola 19, noir, celle du bandeau ocre des pages 5 et 9/21 : une seule
/// écriture pour une seule valeur, quel que soit l'endroit où elle apparaît.
/// Elle se détache d'autant mieux du libellé « Mon Prénom : », gravé en gras
/// dans le gabarit.
function worksheetFirstName(
  ruleStartPx: number,
  ruleEndPx: number,
  labelBaselinePx: number
): TextBox {
  /// Retrait à gauche du filet, pour que le texte ne parte pas de son extrémité.
  const INSET_PX = 16;
  /// Remontée au-dessus de la ligne de base du libellé.
  ///
  /// Le client grave ses libellés à même le filet — 1 à 5 px les séparent. Aligner
  /// la valeur sur cette ligne de base la collait au trait ; on la relève d'un
  /// millimètre. L'écart avec le libellé se voit à peine, l'air sous les lettres
  /// se voit tout de suite.
  const LIFT_PX = 12;
  return {
    xPx: ruleStartPx + INSET_PX,
    yPx: labelBaselinePx - LIFT_PX,
    anchor: "baseline",
    maxWidthPx: ruleEndPx - ruleStartPx - 2 * INSET_PX,
    fontSizePt: 19,
    minFontSizePt: 12,
    font: "gabriola",
    color: INK_COLOR,
  };
}

/// Construit les 7 lignes d'une colonne de tableau à pas régulier.
function columnRows(
  centerXPx: number,
  widthPx: number,
  firstBaselinePx: number,
  pitchPx: number,
  fontSizePt: number
): TextBox[] {
  return Array.from({ length: 7 }, (_, index) => ({
    xPx: centerXPx,
    yPx: Math.round(firstBaselinePx + index * pitchPx),
    anchor: "baseline" as const,
    maxWidthPx: widthPx - 40,
    fontSizePt,
    minFontSizePt: 6,
    font: "cabin",
    color: "#000000",
    align: "center" as const,
  }));
}

/// Page 27 — « Étape 2, j'explore mon Milieu de Vie », tableaux 1 et 2.
/// Le titre de force est centré sur le groupe de trois lignes
/// (Valorisation / Dévalorisation / Neutre), donc sur celle du milieu.
export const WORKSHEET_MILIEU_DE_VIE: WorksheetLayout = {
  firstName: worksheetFirstName(570, 1099, 368),
  forceTitles: columnRows(306, 472, 1912, 236.4, 9),
  uppercase: false,
};

/// Page 34 — tableau 3, « J'évalue et je revalorise ma Personnalité Innée ».
///
/// ⚠️ Le gabarit du client n'est pas vierge : sa première ligne porte encore
/// « LA CRÉATIVE AUDACIEUSE », l'exemple de sa maquette. Sans le masque
/// ci-dessous, le vrai titre viendrait se superposer à cet exemple. Le fond de
/// cellule est un aplat, le rectangle est donc invisible.
///
/// Le même gabarit porte aussi un « 10 » pré-rempli dans les sept cases de la
/// colonne « Étape 1 » : ce sont des réponses d'exemple qui n'ont rien à faire
/// dans le document d'une cliente. On ne les efface pas ici — il faudrait
/// redessiner les cases — c'est un export propre à redemander au client. Une
/// fois livré, supprimer `masks`.
export const WORKSHEET_EVALUATION: WorksheetLayout = {
  firstName: worksheetFirstName(547, 1062, 716),
  forceTitles: columnRows(512, 803, 1772, 259.83, 11),
  uppercase: true,
  masks: [
    // Cellule de la première ligne : entre les filets 110/913 et 1630/1890,
    // rognée de 3 px pour ne pas mordre sur les traits du tableau.
    { xPx: 113, yPx: 1633, widthPx: 797, heightPx: 254, color: "#d4e9ec" },
  ],
};

/// Page 35 — tableau 4, « Plan d'action ».
export const WORKSHEET_PLAN_ACTION: WorksheetLayout = {
  firstName: worksheetFirstName(358, 874, 858),
  forceTitles: columnRows(512, 803, 1742, 260, 11),
  uppercase: true,
};
