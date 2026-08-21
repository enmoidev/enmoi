// Calcul des 7 numéros de force à partir d'une date de naissance

import { evaluateExpression, FormulaError, type Scope } from "./evaluateExpression";
import {
  FIRST_FORCE_NUMBER,
  FORCE_NUMBER_RANGE,
  LAST_FORCE_NUMBER,
} from "@/lib/forces/forceAssets";

export { FormulaError } from "./evaluateExpression";

/// Variables mises à disposition des formules.
///
/// Elles sont passées dans une portée explicite, et non plus substituées
/// textuellement dans l'expression. L'ancienne implémentation enchaînait des
/// String.replace, ce qui imposait de remplacer `a5` avant `a1` et interdisait
/// d'introduire une variable dont le nom préfixe une autre. Cette contrainte
/// n'existe plus.
export type BirthVariables = Scope;

/// Les variables qui ne valent qu'un seul chiffre, et peuvent donc être accolées
/// dans une formule pour en former un nombre : `a3a4` vaut 93 pour une naissance
/// en 1993, `j2m1` vaut 40 pour un 04/07.
///
/// ⚠️ `j3`, `m3` et `a5` en sont volontairement exclus : ils portent le jour, le
/// mois et l'année **complets**, dont le nombre de chiffres varie d'une date à
/// l'autre. Les accoler donnerait un résultat dépendant de la date — `m3m3`
/// vaudrait 77 en juillet et 1010 en octobre — c'est-à-dire une formule qui ne
/// veut plus rien dire.
export const CONCATENABLE_VARIABLES = [
  "j1",
  "j2",
  "m1",
  "m2",
  "a1",
  "a2",
  "a3",
  "a4",
] as const;

/// Décompose une date de naissance en variables de formule.
///
///   j3 / m3 / a5 : jour, mois et année complets
///   j1, j2       : les deux chiffres du jour
///   m1, m2       : les deux chiffres du mois
///   a1..a4       : les quatre chiffres de l'année
///
/// Les huit variables d'un chiffre peuvent en outre être accolées entre elles,
/// voir CONCATENABLE_VARIABLES.
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
  return evaluateExpression(expression, variables, {
    concatenable: CONCATENABLE_VARIABLES,
  });
}

/// Évalue une formule et vérifie que le résultat désigne bien une force.
///
/// Le résultat doit être un entier de 0 à 99 : c'est un numéro de force, pas une
/// valeur continue. On échoue explicitement plutôt que d'arrondir ou de replier la
/// valeur, ce qui produirait un livrable faux sans que personne ne s'en aperçoive.
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

  if (raw < FIRST_FORCE_NUMBER || raw > LAST_FORCE_NUMBER) {
    throw new FormulaError(
      `La formule ${position} donne ${raw}, hors de l'intervalle ${FORCE_NUMBER_RANGE}.`
    );
  }

  return raw;
}
