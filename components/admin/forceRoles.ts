// Rôles symboliques des 7 positions, affichés en repère dans le back-office

/// Le rôle dépend de la position dans les 7, jamais du numéro de la force (1-100).
export const forceRoles: readonly string[] = [
  "Ta colonne vertébrale",
  "Ta boussole",
  "Ta destination",
  "Ton moteur",
  "Ta vitrine",
  "Ton énergie générationnelle",
  "Ton inspiratrice",
];

/// Renvoie le rôle d'une position 1 à 7, ou une chaîne vide hors bornes.
export function roleForPosition(position: number): string {
  return forceRoles[position - 1] ?? "";
}
