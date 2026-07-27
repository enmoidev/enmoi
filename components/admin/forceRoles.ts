// Rôles symboliques des 7 positions, pour l'affichage dans le back-office
//
// La source unique des rôles est lib/forces/roles.ts. Le back-office n'affiche
// que le nom court ; le livrable surimprime le nom et sa description.

import { FORCE_ROLES, roleName } from "@/lib/forces/roles";

/// Noms courts des 7 rôles, dans l'ordre des positions.
export const forceRoles: readonly string[] = FORCE_ROLES.map((role) => role.name);

/// Renvoie le nom du rôle d'une position 1 à 7, ou une chaîne vide hors bornes.
export function roleForPosition(position: number): string {
  return roleName(position);
}
