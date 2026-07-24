// Calcul des 7 numéros de force à partir d'une date de naissance

import { evaluateExpression, FormulaError, type Scope } from "./evaluateExpression";
import { TOTAL_FORCES } from "@/lib/forces/forceAssets";

export { FormulaError } from "./evaluateExpression";

/// Variables mises à disposition des formules.
///
/// Elles sont passées dans une portée explicite, et non plus substituées
/// textuellement dans l'expression. L'ancienne implémentation enchaînait des
/// String.replace, ce qui imposait de remplacer `a5` avant `a1` et interdisait
/// d'introduire une variable dont le nom préfixe une autre. Cette contrainte
/// n'existe plus.
export type BirthVariables = Scope;

/// Décompose une date de naissance en variables de formule.
///
///   j3 / m3 / a5 : jour, mois et année complets
///   j1, j2       : les deux chiffres du jour
///   m1, m2       : les deux chiffres du mois
///   a1..a4       : les quatre chiffres de l'année
export function buildBirthVariables(birthDate: Date): BirthVariables {
  if (Number.isNaN(birthDate.getTime())) {
    throw new FormulaError("Date de naissance invalide.");
  }

  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();

  const dayDigits = String(day).padStart(2, "0");
  const monthDigits = String(month).padStart(2, "0");
  const yearDigits = String(year).padStart(4, "0");

  return Object.freeze({
    j3: day,
    m3: month,
    a5: year,
    j1: Number(dayDigits[0]),
    j2: Number(dayDigits[1]),
    m1: Number(monthDigits[0]),
    m2: Number(monthDigits[1]),
    a1: Number(yearDigits[0]),
    a2: Number(yearDigits[1]),
    a3: Number(yearDigits[2]),
    a4: Number(yearDigits[3]),
  });
}

/// Évalue une formule. Lève une FormulaError si l'expression est invalide.
export function evaluateFormula(expression: string, variables: BirthVariables): number {
  return evaluateExpression(expression, variables);
}

/// Évalue une formule et vérifie que le résultat désigne bien une force.
///
/// Le résultat doit être un entier de 1 à 100 : c'est un numéro de force, pas une
/// valeur continue. On échoue explicitement plutôt que d'arrondir ou de replier la
/// valeur, ce qui produirait un PMI faux sans que personne ne s'en aperçoive.
export function evaluateForceNumber(
  expression: string,
  variables: BirthVariables,
  position: number
): number {
  const raw = evaluateFormula(expression, variables);

  if (!Number.isInteger(raw)) {
    throw new FormulaError(
      `La formule ${position} donne ${raw}, qui n'est pas un entier. ` +
        `Un numéro de force est entier : ajoutez round(), floor() ou ceil() à la formule.`
    );
  }

  if (raw < 1 || raw > TOTAL_FORCES) {
    throw new FormulaError(
      `La formule ${position} donne ${raw}, hors de l'intervalle 1 à ${TOTAL_FORCES}.`
    );
  }

  return raw;
}
