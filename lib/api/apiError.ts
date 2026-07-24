// Traduction centralisée des erreurs en réponses HTTP

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth-utils/errors";
import { ObjectNotFoundError } from "@/lib/storage";

/// Erreur métier destinée à être affichée telle quelle à l'administrateur.
export class BusinessError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BusinessError";
    this.status = status;
  }
}

/// Convertit une erreur en réponse JSON avec le statut adapté.
///
/// `context` n'apparaît que dans les logs serveur : le message renvoyé au client
/// reste volontairement générique pour les erreurs inattendues, afin de ne pas
/// divulguer de détail d'implémentation.
export function apiError(err: unknown, context: string): NextResponse {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }

  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }

  if (err instanceof ObjectNotFoundError) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }

  if (err instanceof BusinessError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join(" ");
    return NextResponse.json({ error: message || "Requête invalide." }, { status: 400 });
  }

  console.error(`[${context}]`, err);
  return NextResponse.json(
    { error: "Une erreur inattendue est survenue." },
    { status: 500 }
  );
}
