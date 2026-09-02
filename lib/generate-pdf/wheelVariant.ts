// Choix de la variante de la roue (page 3) selon la personne

import type { PdfData, PdfForce } from "@/types/pdf";

/// Les quatre versions de la page 3 livrées par le client.
///
/// La roue et ses sept pastilles sont les mêmes dans les quatre : seul change
/// le texte imprimé sous le schéma, qui commente une particularité du tirage.
export type WheelVariant =
  /// Aucune particularité : le seul texte est « Chacune de mes 7 Forces… ».
  | "base"
  /// Deux des sept positions désignent la même force — un renforcement.
  | "forcesIdentiques"
  /// Naissance en septembre : le « triangle d'or en force alternée ».
  | "septembre"
  /// Les deux à la fois.
  | "forcesIdentiquesEtSeptembre";

/// Mois qui déclenche la mention « Natifs et natives du mois de Septembre ».
const SEPTEMBER = 9;

/// Deux des sept positions désignent-elles la même force ?
///
/// La comparaison porte sur le **numéro** de la force (0 à 99), pas sur son
/// titre : deux forces distinctes pourraient partager un titre provisoire tant
/// que le client n'a pas livré ses 100 visuels.
export function hasRepeatedForce(forces: readonly PdfForce[]): boolean {
  return new Set(forces.map((force) => force.number)).size < forces.length;
}

/// Naissance en septembre, d'après une date ISO (YYYY-MM-DD).
export function isBornInSeptember(birthDate: string): boolean {
  return Number(birthDate.split("-")[1]) === SEPTEMBER;
}

/// La variante qui s'applique à cette personne.
///
/// Les deux critères se calculent entièrement à partir des données déjà
/// présentes : rien à saisir dans le back-office, rien à stocker en base.
export function wheelVariant(data: PdfData): WheelVariant {
  const repeated = hasRepeatedForce(data.forces);
  const september = isBornInSeptember(data.birthDate);

  if (repeated && september) return "forcesIdentiquesEtSeptembre";
  if (repeated) return "forcesIdentiques";
  if (september) return "septembre";
  return "base";
}

/// Le gabarit de chaque variante, relatif à public/pdf-design/.
/// Les quatre pages sont communes aux trois livrables.
export const WHEEL_ASSETS: Readonly<Record<WheelVariant, string>> = {
  base: "commun/03-roue.png",
  forcesIdentiques: "commun/03-roue-forces-identiques.png",
  septembre: "commun/03-roue-septembre.png",
  forcesIdentiquesEtSeptembre: "commun/03-roue-forces-identiques-et-septembre.png",
};

/// Le gabarit de la page 3 pour cette personne.
export function wheelAsset(data: PdfData): string {
  return WHEEL_ASSETS[wheelVariant(data)];
}
