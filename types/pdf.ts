// Types de données consommés par le générateur de livrable

/// Les trois livrables commercialisés. L'identifiant sert de clé partout :
/// manifeste des pages, dossier des gabarits, paramètre d'API.
export type DeliverableId = "freemium" | "livrable1" | "livrable2";

/// Une force retenue pour un livrable, à sa position dans les 7.
export type PdfForce = {
  /// Numéro de la force, de 0 à 99 — sert uniquement à retrouver les visuels,
  /// n'est jamais imprimé sur le document.
  number: number;
  /// Titre de la force. Déjà gravé dans les visuels de la fiche ; sert à la roue
  /// de la page 3, aux tableaux du livrable 2 et aux messages d'erreur.
  title: string;
  /// Position dans les 7 (1 à 7) — c'est cette valeur qui est imprimée.
  position: number;
  /// Texte du rôle surimprimé sur la page B (« Nom » - Description).
  symbolicRole: string;
  /// Les deux visuels pleine page de la fiche, déjà mis en forme par le client.
  /// Absents pour une force que le livrable ne développe pas : le freemium
  /// nomme les 7 forces sur la roue mais ne détaille que la première. Les deux
  /// pages vont ensemble — jamais l'une sans l'autre.
  sheet?: { pageA: Buffer; pageB: Buffer };
};

export type PdfData = {
  deliverable: DeliverableId;
  firstName: string;
  lastName: string;
  birthPlace: string;
  /// Date ISO (YYYY-MM-DD)
  birthDate: string;
  /// Heure de naissance « HH:MM », facultative. Le client la signale comme
  /// « si connue » : elle n'est qu'imprimée sur la couverture, aucune formule
  /// ne s'en sert.
  birthTime?: string;
  /// Les 7 forces de la personne, dans l'ordre des positions. Le freemium n'en
  /// détaille qu'une, mais les 7 sont nécessaires : la roue de la page 3 les
  /// nomme toutes.
  forces: PdfForce[];
};
