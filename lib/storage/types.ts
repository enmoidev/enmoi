// Contrat de stockage objet — le métier ne doit jamais dépendre d'un fournisseur précis

/// Erreur levée quand une clé demandée n'existe pas dans le stockage.
export class ObjectNotFoundError extends Error {
  constructor(key: string) {
    super(`Objet introuvable dans le stockage : ${key}`);
    this.name = "ObjectNotFoundError";
  }
}

export interface ObjectStorage {
  /// Dépose (ou remplace) un objet.
  put(key: string, body: Buffer, contentType: string): Promise<void>;

  /// Lit un objet. Lève ObjectNotFoundError si la clé n'existe pas.
  getBuffer(key: string): Promise<Buffer>;

  /// Supprime un objet. Ne lève pas d'erreur si la clé n'existait pas.
  remove(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;

  /// URL temporaire de lecture, pour la prévisualisation dans le back-office.
  /// Le bucket étant privé, c'est le seul moyen d'afficher un visuel.
  signedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
