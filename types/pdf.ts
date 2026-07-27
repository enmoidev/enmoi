// Types de données consommés par le générateur de livrable

/// Une force retenue pour un livrable, à sa position dans les 7.
export type PdfForce = {
  /// Numéro de la force sur 100 — sert uniquement à retrouver les visuels,
  /// n'est jamais imprimé sur le document.
  number: number;
  /// Titre de la force. Déjà gravé dans les visuels ; sert à la page de
  /// synthèse et aux messages d'erreur.
  title: string;
  /// Position dans les 7 (1 à 7) — c'est cette valeur qui est imprimée.
  position: number;
  /// Texte du rôle surimprimé sur la page B (« Nom » - Description).
  symbolicRole: string;
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
