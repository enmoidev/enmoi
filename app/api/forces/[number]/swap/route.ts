// Échange les numéros de deux forces
//
// Les 100 numéros étant tous attribués, déplacer une force vers un numéro déjà
// pris est nécessairement un échange : la force qui l'occupait reçoit l'ancien
// numéro. Il n'y a pas de « case libre » où la ranger.
//
// Les visuels ne bougent pas : leur clé de stockage dérive de l'identifiant
// interne de la force, pas de son numéro (voir lib/forces/forceAssets.ts).

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError, BusinessError } from "@/lib/api/apiError";
import { forceNumberSchema } from "@/lib/forces/forceAssets";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string }> };

const bodySchema = z.object({ target: forceNumberSchema });

/// Numéro de transit, le temps de l'échange.
///
/// `number` est unique : passer directement le numéro de A à B violerait la
/// contrainte. On gare donc A hors des bornes métier (1 à 100) le temps de
/// libérer sa place. Négatif, donc hors d'atteinte d'une force réelle.
const PARKING_NUMBER = -1;

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { number } = await context.params;
    const sourceNumber = forceNumberSchema.parse(number);
    const { target: targetNumber } = bodySchema.parse(await req.json());

    if (sourceNumber === targetNumber) {
      throw new BusinessError("Cette force porte déjà ce numéro.");
    }

    const [source, target] = await Promise.all([
      prisma.force.findUnique({ where: { number: sourceNumber } }),
      prisma.force.findUnique({ where: { number: targetNumber } }),
    ]);

    if (!source) {
      throw new BusinessError(`La force n° ${sourceNumber} n'existe pas.`, 404);
    }
    if (!target) {
      throw new BusinessError(`La force n° ${targetNumber} n'existe pas.`, 404);
    }

    // Transaction : à aucun moment la base ne doit se retrouver avec une force
    // garée sur le numéro de transit.
    const [, updatedTarget, updatedSource] = await prisma.$transaction([
      prisma.force.update({
        where: { id: source.id },
        data: { number: PARKING_NUMBER },
      }),
      prisma.force.update({
        where: { id: target.id },
        data: { number: sourceNumber },
      }),
      prisma.force.update({
        where: { id: source.id },
        data: { number: targetNumber },
      }),
    ]);

    return NextResponse.json({ forces: [updatedSource, updatedTarget] });
  } catch (err) {
    return apiError(err, "POST /api/forces/[number]/swap");
  }
}
