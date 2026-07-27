// Paramètres globaux — configuration singleton du back-office

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError } from "@/lib/api/apiError";

export const runtime = "nodejs";

// Les paramètres globaux valent pour TOUTE l'application : il ne doit exister
// qu'une seule ligne. On la force sous un identifiant fixe, ce qui rend la
// création idempotente et évite tout doublon, même en cas d'appels concurrents.
const SETTINGS_ID = "global";

/// Récupère l'unique ligne de paramètres, en la créant avec ses valeurs par
/// défaut si elle n'existe pas. Évite un 404 sur une base fraîchement initialisée.
async function getOrCreateSettings() {
  return prisma.globalSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function GET() {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch (err) {
    return apiError(err, "GET /api/settings");
  }
}

const updateSchema = z.object({
  ambassadorAccounts: z
    .number()
    .int("Le nombre de comptes ambassadeur doit être un entier.")
    .min(0, "Le nombre de comptes ambassadeur ne peut pas être négatif."),
});

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { ambassadorAccounts } = updateSchema.parse(await req.json());

    // Upsert sur l'identifiant fixe : met à jour la ligne unique, ou la crée si
    // c'est le premier enregistrement.
    const updated = await prisma.globalSettings.upsert({
      where: { id: SETTINGS_ID },
      update: { ambassadorAccounts },
      create: { id: SETTINGS_ID, ambassadorAccounts },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err, "PUT /api/settings");
  }
}
