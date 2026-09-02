// Composition des trois livrables : quelles pages, dans quel ordre
//
// Chaque livrable est décrit ici et nulle part ailleurs. Le générateur ne fait
// que dérouler ce manifeste : poser le gabarit, appliquer la surimpression
// éventuelle, puis intercaler les fiches de forces au point prévu.
//
// La pagination des commentaires est celle imprimée par le client sur ses
// gabarits, ce qui permet de rapprocher chaque ligne du PDF de référence.
// Attention : le livrable 1 de référence n'a que 9 pages parce qu'il ne
// contient qu'une fiche d'exemple ; en production ses 7 fiches occupent les
// pages 7 à 20 et « Mon évolution » tombe donc en page 21.

import type { DeliverableId, PdfData } from "@/types/pdf";
import { wheelAsset } from "./wheelVariant";

/// Les surimpressions possibles sur une page de gabarit.
/// Les coordonnées de chacune vivent dans overlayLayout.ts.
export type PageOverlay =
  /// Couverture : prénom, date et heure de naissance.
  | "cover"
  /// Roue « Ma personnalité innée » : le prénom au centre, les 7 titres de force.
  | "wheel"
  /// Page à bandeau ocre (citation, guide / auto-bilan) : le prénom seul, en
  /// haut à gauche du bandeau.
  | "ochreBand"
  /// Livrable 1, page 21 « Mon évolution » : le même prénom au même endroit,
  /// mais sur un bandeau dont le titre occupe le milieu.
  | "monEvolution"
  /// Livrable 2, tableaux 1 & 2 : le prénom et les 7 titres.
  | "milieuDeVie"
  /// Livrable 2, tableau 3 : le prénom et les 7 titres, en capitales.
  | "evaluation"
  /// Livrable 2, tableau 4 : le prénom et les 7 titres, en capitales.
  | "planAction";

export type DeliverablePage = {
  /// Chemin du gabarit, relatif à public/pdf-design/.
  ///
  /// Une fonction quand le gabarit dépend de la personne : la page 3 existe en
  /// quatre versions selon les particularités du tirage (voir wheelVariant.ts).
  /// C'est la seule page dans ce cas ; tout le reste est déclaré en dur.
  asset: string | ((data: PdfData) => string);
  /// Surimpression à appliquer. Absent = page entièrement composée par le client.
  overlay?: PageOverlay;
};

export type Deliverable = {
  id: DeliverableId;
  /// Libellé affiché dans le back-office.
  ///
  /// Le produit s'appelle « Miroir enMOI » et se décline en trois versions.
  /// Les identifiants (`freemium`, `livrable1`, `livrable2`) gardent leur nom
  /// d'origine : ils ne s'affichent nulle part — voir « Vocabulaire » dans
  /// CLAUDE.md.
  label: string;
  /// Segment de nom du fichier téléchargé — sans accent ni espace, pour rester
  /// lisible quel que soit le système qui le recevra. Déclaré plutôt que dérivé
  /// du libellé : une translittération du français est une source de surprises.
  fileSlug: string;
  /// Nombre de fiches de forces développées (2 pages chacune). Les 7 forces
  /// sont toujours calculées : la roue de la page 3 les nomme toutes.
  detailedForceCount: number;
  /// Pages posées avant les fiches de forces.
  before: readonly DeliverablePage[];
  /// Pages posées après.
  after: readonly DeliverablePage[];
};

/// Les six premières pages sont les mêmes dans les trois livrables, à deux
/// exceptions près : la couverture annonce la formule, et la page blanche porte
/// un folio dans le livrable 2. Les quatre autres sont partagées.
///
/// Le client exporte chaque document séparément, si bien que ses trois versions
/// des pages 3 à 6 dérivent de un à trois pixels les unes des autres. Partager
/// un seul fichier supprime cette dérive — et surtout, les coordonnées de
/// overlayLayout.ts sont relevées sur ce fichier-là, donc justes pour les trois.
function introPages(dir: string): DeliverablePage[] {
  return [
    { asset: `${dir}/01-couverture.png`, overlay: "cover" },
    { asset: `${dir}/02-vierge.png` },
    { asset: wheelAsset, overlay: "wheel" },
    { asset: "commun/04-je-decouvre.png" },
    { asset: "commun/05-citation.png", overlay: "ochreBand" },
    { asset: "commun/06-fiche-explicative.png" },
  ];
}

export const DELIVERABLES: Readonly<Record<DeliverableId, Deliverable>> = {
  // 14 pages : 6 d'introduction, 1 fiche de force, puis l'introduction à la
  // méthode des 3 étapes (pages 9 à 14).
  freemium: {
    id: "freemium",
    label: "Version offerte",
    fileSlug: "miroir-enmoi-version-offerte",
    detailedForceCount: 1,
    before: introPages("freemium"),
    after: [
      { asset: "freemium/09-guide-auto-bilan.png", overlay: "ochreBand" },
      { asset: "freemium/10-repercussions.png" },
      { asset: "freemium/11-engagement.png" },
      { asset: "freemium/12-methode-3-etapes.png" },
      { asset: "freemium/13-etape-2.png" },
      { asset: "freemium/14-auto-bilan.png" },
    ],
  },

  // 21 pages : 6 d'introduction, les 7 fiches (7 à 20), puis « Mon évolution »
  // qui renvoie au freemium ou invite à passer au livrable 2.
  livrable1: {
    id: "livrable1",
    label: "Version découverte",
    fileSlug: "miroir-enmoi-version-decouverte",
    detailedForceCount: 7,
    before: introPages("livrable1"),
    after: [{ asset: "livrable1/21-mon-evolution.png", overlay: "monEvolution" }],
  },

  // 35 pages : 6 d'introduction, les 7 fiches (7 à 20), puis la méthode
  // complète des 3 étapes et ses tableaux de travail (21 à 35).
  livrable2: {
    id: "livrable2",
    label: "Version complète",
    fileSlug: "miroir-enmoi-version-complete",
    detailedForceCount: 7,
    before: introPages("livrable2"),
    after: [
      { asset: "livrable2/21-guide-auto-bilan.png", overlay: "ochreBand" },
      { asset: "livrable2/22-repercussions.png" },
      { asset: "livrable2/23-engagement.png" },
      { asset: "livrable2/24-methode-3-etapes.png" },
      { asset: "livrable2/25-etape-2.png" },
      // Les 47 questions, désormais étalées sur quatre pages au lieu de deux.
      { asset: "livrable2/26-questions1.png" },
      { asset: "livrable2/27-questions2.png" },
      { asset: "livrable2/28-questions3.png" },
      { asset: "livrable2/29-questions4.png" },
      { asset: "livrable2/30-tableaux-familles.png", overlay: "milieuDeVie" },
      { asset: "livrable2/31-auto-bilan.png" },
      { asset: "livrable2/32-etape3.png" },
      { asset: "livrable2/33-temoignage.png" },
      { asset: "livrable2/34-tableau3.png", overlay: "evaluation" },
      { asset: "livrable2/35-tableau4.png", overlay: "planAction" },
    ],
  },
};

export const DELIVERABLE_IDS = Object.keys(DELIVERABLES) as DeliverableId[];

/// Le gabarit d'une page pour une personne donnée.
export function pageAsset(page: DeliverablePage, data: PdfData): string {
  return typeof page.asset === "function" ? page.asset(data) : page.asset;
}

/// Réduit un nom à des caractères sûrs pour un nom de fichier.
///
/// Les accents sont **translittérés**, jamais remplacés : « Sébastien » donne
/// « Sebastien », et non « S_bastien ». La décomposition Unicode (NFD) sépare
/// chaque lettre de son accent, qu'il ne reste plus qu'à retirer — ce qui couvre
/// d'un coup é, è, ê, ë, ï, ô, ù, ç… sans table de correspondance à tenir.
///
/// Les ligatures échappent à NFD, qui ne les décompose pas : elles sont donc
/// traitées avant. Tout le reste — espaces, apostrophes, points — devient un
/// trait d'union, ce qui préserve « Marie-Charlotte » tel quel et rend
/// « D'Artagnan » lisible.
function asciiName(name: string): string {
  return name
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE")
    .normalize("NFD")
    // Bloc des diacritiques combinants, ce que NFD vient de détacher.
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/// Nom du fichier téléchargé pour une personne.
///
/// Un nom vide est simplement omis plutôt que de laisser un séparateur
/// orphelin : la génération de test se fait parfois sans état civil complet.
export function pdfFileName(
  deliverable: Deliverable,
  firstName: string,
  lastName: string
): string {
  const parts = [deliverable.fileSlug, asciiName(firstName), asciiName(lastName)];
  return `${parts.filter(Boolean).join("_")}.pdf`;
}

/// Nombre total de pages d'un livrable — pour l'annoncer dans le back-office.
export function pageCount(deliverable: Deliverable): number {
  return (
    deliverable.before.length +
    deliverable.detailedForceCount * 2 +
    deliverable.after.length
  );
}
