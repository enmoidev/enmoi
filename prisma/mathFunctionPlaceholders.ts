// Expressions de repli des 7 formules, partagées par les scripts de seed et de réécriture
//
// ⚠️ CE SONT DES PLACEHOLDERS TECHNIQUES, PAS LES FORMULES MÉTIER.
//
// Elles garantissent seulement un résultat entier entre 1 et 100, ce qui permet de
// faire tourner la chaîne complète (calcul → sélection des visuels → PDF) sans
// attendre le client. Les forces qu'elles désignent n'ont AUCUNE signification :
// un PMI produit avec ces expressions est un document de test et ne doit jamais
// être remis à une personne réelle.
//
// Le motif `(abs(...) % 100) + 1` borne mécaniquement le résultat : abs() écarte
// les négatifs (en JS, -7 % 100 vaut -7), le modulo ramène dans 0..99 et le +1
// décale vers 1..100. Seuls +, - et * sont utilisés afin que le résultat reste
// entier — une division produirait un décimal, rejeté par evaluateForceNumber().
//
// Vérifié exhaustivement sur les 73 414 dates valides de 1900 à 2100.

export const PLACEHOLDER_EXPRESSIONS = [
  "(abs(j3 * m3 + a5) % 100) + 1",
  "(abs((a1 + a2 + a3 + a4) * (j1 + j2 + m1 + m2)) % 100) + 1",
  "(abs(j3 * 7 + m3 * 13) % 100) + 1",
  "(abs(a5 - j3 * m3) % 100) + 1",
  "(abs(j3 + m3 * a2 + a4 * 3) % 100) + 1",
  "(abs(a3 * 11 + j2 * 7 + m2 * 5) % 100) + 1",
  "(abs(j3 * j3 + m3 * m3 + a4) % 100) + 1",
];
