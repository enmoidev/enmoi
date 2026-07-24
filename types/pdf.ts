// Types de données consommés par le générateur de PMI

/// Les 7 rôles symboliques, indexés par position (index 0 = position 1).
/// L'ordre est métier : ne pas le modifier.
export const SYMBOLIC_ROLES = [
  "Ta colonne vertébrale",
  "Ta boussole",
  "Ta destination",
  "Ton moteur",
  "Ta vitrine",
  "Ton énergie générationnelle",
  "Ton inspiratrice",
] as const;

export type SymbolicRole = (typeof SYMBOLIC_ROLES)[number];

/// Une force retenue pour un PMI, à sa position dans les 7.
export type PdfForce = {
  /// Numéro de la force sur 100 — sert uniquement à retrouver les visuels,
  /// n'est jamais imprimé sur le document.
  number: number;
  /// Titre de la force. Déjà gravé dans les visuels ; sert à la page de
  /// synthèse et aux messages d'erreur.
  title: string;
  /// Position dans les 7 (1 à 7) — c'est cette valeur qui est imprimée.
  position: number;
  symbolicRole: SymbolicRole;
  /// Visuels pleine page, déjà mis en forme par le client.
  pageA: Buffer;
  pageB: Buffer;
};

export type PdfData = {
  firstName: string;
  lastName: string;
  birthPlace: string;
  /// Date ISO (YYYY-MM-DD)
  birthDate: string;
  forces: PdfForce[];
};
