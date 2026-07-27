// Les 7 rôles symboliques, source unique — back-office et livrable
//
// Le rôle dépend de la POSITION dans les 7 (1 à 7), jamais du numéro de la force
// (1-100). Les libellés viennent de la « Fiche explicative » fournie par le client.

/// Un rôle = un nom court et sa description.
export type ForceRole = { readonly name: string; readonly description: string };

/// Index 0 = position 1. L'ordre est métier : ne pas le modifier.
export const FORCE_ROLES: readonly ForceRole[] = [
  { name: "Ma déterminante", description: "Exprime mon caractère et ma détermination profonde." },
  { name: "Ma conseillère", description: "Rappelle chaque jour ce qui est prioritaire pour moi." },
  { name: "Ma destination", description: "Ma mission à accomplir." },
  { name: "Ma stimulante", description: "Ma ressource quotidienne." },
  { name: "Ma relationnelle", description: "Ma vitrine sociale, ma manière de m'adresser aux autres." },
  { name: "Ma générationnelle", description: "Le partage commun à toute une génération." },
  { name: "Mon inspiratrice", description: "La bonne étoile, ma boussole non-consciente." },
];

/// Nombre de forces retenues dans un livrable (et de formules attendues).
export const ROLE_COUNT = FORCE_ROLES.length;

/// Nom court du rôle d'une position 1 à 7 — pour l'affichage dans le back-office.
export function roleName(position: number): string {
  return FORCE_ROLES[position - 1]?.name ?? "";
}

/// Texte surimprimé sur la page B, à droite de « Son rôle : ».
/// Format imposé par le client : « Nom » - Description.
export function roleOverlayText(position: number): string {
  const role = FORCE_ROLES[position - 1];
  return role ? `« ${role.name} » - ${role.description}` : "";
}
