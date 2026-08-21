// Formes sérialisées des modèles Prisma, échangées entre le back-office et les routes API

export type ForceType = {
  id: string;
  number: number;
  title: string;
  pageAKey: string | null;
  pageBKey: string | null;
  pageAFilename: string | null;
  pageBFilename: string | null;
};

/// Une force est exploitable dans un PMI seulement si ses deux visuels sont déposés.
export function isForceComplete(force: Pick<ForceType, "pageAKey" | "pageBKey">): boolean {
  return Boolean(force.pageAKey && force.pageBKey);
}

export type MathFunctionType = {
  id: string;
  number: number;
  expression: string;
};

/// Un jeu complet des 7 formules, appliqué à une tranche d'années de naissance.
/// Bornes nulles = jeu par défaut, appliqué hors tranches.
export type FormulaSetType = {
  id: string;
  label: string;
  yearFrom: number | null;
  yearTo: number | null;
  functions: MathFunctionType[];
};
