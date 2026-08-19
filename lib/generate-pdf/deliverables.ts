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

import type { DeliverableId } from "@/types/pdf";

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
  /// Livrable 2, tableaux 1 & 2 : prénom, date du jour, les 7 titres.
  | "milieuDeVie"
  /// Livrable 2, tableau 3 : prénom, date du jour, les 7 titres en capitales.
  | "evaluation"
  /// Livrable 2, tableau 4 : prénom, date du jour, les 7 titres en capitales.
  | "planAction";

export type DeliverablePage = {
  /// Chemin du gabarit, relatif à public/pdf-design/.
  asset: string;
  /// Surimpression à appliquer. Absent = page entièrement composée par le client.
  overlay?: PageOverlay;
};

export type Deliverable = {
  id: DeliverableId;
  /// Libellé affiché dans le back-office.
  label: string;
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
    { asset: "commun/03-roue.png", overlay: "wheel" },
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
    label: "Freemium",
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
    label: "Livrable 1 — Formule Découverte, Étape 1",
    detailedForceCount: 7,
    before: introPages("livrable1"),
    after: [{ asset: "livrable1/21-mon-evolution.png" }],
  },

  // 35 pages : 6 d'introduction, les 7 fiches (7 à 20), puis la méthode
  // complète des 3 étapes et ses tableaux de travail (21 à 35).
  livrable2: {
    id: "livrable2",
    label: "Livrable 2 — Formule Complète, Méthode des 3 Étapes",
    detailedForceCount: 7,
    before: introPages("livrable2"),
    after: [
      { asset: "livrable2/21-guide-auto-bilan.png", overlay: "ochreBand" },
      { asset: "livrable2/22-repercussions.png" },
      { asset: "livrable2/23-engagement.png" },
      { asset: "livrable2/24-methode-3-etapes.png" },
      { asset: "livrable2/25-etape-2.png" },
      { asset: "livrable2/26-auto-bilan.png" },
      { asset: "livrable2/27-tableaux-1-2.png", overlay: "milieuDeVie" },
      { asset: "livrable2/28-etape-3.png" },
      { asset: "livrable2/29-temoignages.png" },
      { asset: "livrable2/30-annexe-etape-2.png" },
      { asset: "livrable2/31-complement-etape-2.png" },
      { asset: "livrable2/32-questions-1.png" },
      { asset: "livrable2/33-questions-2.png" },
      { asset: "livrable2/34-tableau-3.png", overlay: "evaluation" },
      { asset: "livrable2/35-tableau-4.png", overlay: "planAction" },
    ],
  },
};

export const DELIVERABLE_IDS = Object.keys(DELIVERABLES) as DeliverableId[];

/// Nombre total de pages d'un livrable — pour l'annoncer dans le back-office.
export function pageCount(deliverable: Deliverable): number {
  return (
    deliverable.before.length +
    deliverable.detailedForceCount * 2 +
    deliverable.after.length
  );
}
