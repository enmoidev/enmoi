// Choix du jeu de formules applicable à une année de naissance

import { FormulaError } from "./evaluateExpression";

/// Identifiant du jeu par défaut, fixé par la migration `formula_sets`.
/// Les scripts de seed s'y raccrochent sans avoir à le chercher.
export const DEFAULT_FORMULA_SET_ID = "formulaset_defaut";

/// Les seules bornes suffisent à toutes les règles de ce fichier : un jeu qu'on
/// s'apprête à créer n'a pas encore d'identifiant.
export type YearRange = {
  yearFrom: number | null;
  yearTo: number | null;
};

/// Ce dont la sélection a besoin — un sous-ensemble du modèle Prisma, pour que
/// la règle reste testable sans base.
export type SelectableFormulaSet = YearRange & {
  id: string;
  label: string;
};

/// Un jeu couvre-t-il une tranche d'années, ou est-il le jeu par défaut ?
export function isDefaultSet(set: YearRange): boolean {
  return set.yearFrom === null && set.yearTo === null;
}

/// Libellé de la tranche, pour l'écran d'édition et les messages d'erreur.
export function describeRange(set: YearRange): string {
  if (isDefaultSet(set)) return "toutes les autres années";
  if (set.yearFrom !== null && set.yearTo !== null) {
    return set.yearFrom === set.yearTo
      ? `année ${set.yearFrom}`
      : `années ${set.yearFrom} à ${set.yearTo}`;
  }
  return set.yearFrom !== null
    ? `à partir de ${set.yearFrom}`
    : `jusqu'à ${set.yearTo}`;
}

/// Le jeu couvre-t-il cette année de naissance ?
///
/// Les bornes sont **incluses** des deux côtés : la tranche 2000-2009 couvre
/// bien les naissances de 2000 et de 2009. Une borne absente ne limite pas
/// ce côté-là.
function covers(set: YearRange, year: number): boolean {
  if (isDefaultSet(set)) return false;
  if (set.yearFrom !== null && year < set.yearFrom) return false;
  if (set.yearTo !== null && year > set.yearTo) return false;
  return true;
}

/// Choisit le jeu de formules à appliquer à une année de naissance.
///
/// Une tranche l'emporte toujours sur le jeu par défaut : c'est tout l'objet du
/// cas particulier. Les jeux étant posés par migration, ils ne se recouvrent
/// pas ; le départage en faveur de la tranche la plus étroite n'est là que pour
/// rester déterministe si la base était modifiée à la main.
export function selectFormulaSet<T extends SelectableFormulaSet>(
  sets: readonly T[],
  year: number
): T {
  const matching = sets.filter((set) => covers(set, year));

  if (matching.length > 0) {
    return [...matching].sort((a, b) => rangeWidth(a) - rangeWidth(b))[0];
  }

  const fallback = sets.find(isDefaultSet);
  if (!fallback) {
    throw new FormulaError(
      "Aucun jeu de formules par défaut n'est enregistré. " +
        "Créez-en un depuis /admin/formules."
    );
  }
  return fallback;
}

/// Largeur d'une tranche, pour départager deux jeux qui se recouvriraient.
function rangeWidth(set: YearRange): number {
  if (set.yearFrom === null || set.yearTo === null) return Number.MAX_SAFE_INTEGER;
  return set.yearTo - set.yearFrom;
}
