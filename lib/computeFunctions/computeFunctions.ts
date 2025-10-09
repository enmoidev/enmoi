import { Parser } from 'expr-eval';

/**
 * function replace variables inside function and compute it
 * @param formula expression of function
 * @param day day using inside function
 * @param month month using inside function
 * @param year year using inside function
 * @returns return compure or null
 */

export const evaluateFormula = (formula: string, day: number, month: number, year: number, year1: number, year2: number, year3: number, year4: number, day1: number, day2: number, month1: number, month2: number): number | null => {

  try {

    const compiledFormula = formula.replace(/j3/g, `${day}`).replace(/m3/g, `${month}`).replace(/a5/g, `${year}`).replace(/a1/g, `${year1}`).replace(/a2/g, `${year2}`).replace(/a3/g, `${year3}`).replace(/a4/g, `${year4}`).replace(/j1/g, `${day1}`).replace(/j2/g, `${day2}`).replace(/m1/g, `${month1}`).replace(/m2/g, `${month2}`);

    // Use expr-eval Parser to evaluate function
    const parser = new Parser();
    const expression = parser.parse(compiledFormula);
    const result = expression.evaluate();

    return result;

  } catch (err) {
    console.error("Erreur d'évaluation de la formule", err);
    return null;
  }
  
};