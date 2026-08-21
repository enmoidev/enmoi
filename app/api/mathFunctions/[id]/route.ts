// Une formule — lecture et modification de son expression

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError, BusinessError } from "@/lib/api/apiError";
import { buildBirthVariables, evaluateFormula } from "@/lib/computeFunctions/computeFunctions";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/// Seule l'expression est modifiable. Le corps était auparavant passé tel quel à
/// `prisma.update`, ce qui laissait réécrire n'importe quel champ du modèle —
/// `number` compris, et donc casser l'ordre des 7 positions.
const patchSchema = z.object({
  expression: z.string().trim().min(1, "L'expression est obligatoire."),
});

/// Date arbitraire mais valide, pour vérifier qu'une expression s'évalue.
/// Une formule qui échoue ici échouerait pour toute personne : autant le dire à
/// la saisie plutôt qu'au moment de générer un livrable.
const PROBE_DATE = new Date(Date.UTC(1993, 6, 4));

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { id } = await context.params;
    const mathFunction = await prisma.mathFunction.findUnique({ where: { id } });

    if (!mathFunction) {
      throw new BusinessError("Cette formule n'existe pas.", 404);
    }

    return NextResponse.json(mathFunction);
  } catch (err) {
    return apiError(err, "GET /api/mathFunctions/[id]");
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { id } = await context.params;
    const { expression } = patchSchema.parse(await req.json());

    const existing = await prisma.mathFunction.findUnique({ where: { id } });
    if (!existing) {
      throw new BusinessError("Cette formule n'existe pas.", 404);
    }

    // Refus d'enregistrer une expression syntaxiquement invalide : le message de
    // l'évaluateur nomme précisément ce qui cloche.
    try {
      evaluateFormula(expression, buildBirthVariables(PROBE_DATE));
    } catch (err) {
      throw new BusinessError(
        err instanceof Error ? err.message : "Expression invalide."
      );
    }

    const updated = await prisma.mathFunction.update({
      where: { id },
      data: { expression },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return apiError(err, "PUT /api/mathFunctions/[id]");
  }
}
