// Erreurs d'authentification et d'autorisation, distinguées pour produire le bon statut HTTP

/// Aucune session valide : l'utilisateur n'est pas authentifié.
export class UnauthorizedError extends Error {
  constructor(message = "Authentification requise.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/// Session valide mais rôle insuffisant.
export class ForbiddenError extends Error {
  constructor(message = "Accès non autorisé.") {
    super(message);
    this.name = "ForbiddenError";
  }
}
