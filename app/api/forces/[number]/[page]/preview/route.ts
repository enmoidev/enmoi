// Prévisualisation d'un visuel de force dans le back-office
//
// Le bucket étant privé, le fichier est servi par cette route après contrôle de
// session, plutôt que par une URL publique. Le contenu transite donc par la
// fonction : à réserver à l'affichage à la demande, pas à une grille de 200
// vignettes chargées d'un coup.

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError, BusinessError } from "@/lib/api/apiError";
import { getStorage } from "@/lib/storage";
import {
  forceNumberSchema,
  forcePageSchema,
  type ForcePage,
} from "@/lib/forces/forceAssets";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string; page: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { number, page } = await context.params;
    const forceNumber = forceNumberSchema.parse(number);
    const forcePage = forcePageSchema.parse(page) as ForcePage;

    const force = await prisma.force.findUnique({ where: { number: forceNumber } });
    if (!force) {
      throw new BusinessError(`La force n° ${forceNumber} n'existe pas.`, 404);
    }

    // On lit la clé enregistrée plutôt que de la reconstruire : si la colonne est
    // vide, le visuel n'a pas été déposé et il ne faut pas interroger le stockage.
    const key = forcePage === "a" ? force.pageAKey : force.pageBKey;
    if (!key) {
      throw new BusinessError(
        `Le visuel de la page ${forcePage.toUpperCase()} de la force n° ${forceNumber} n'a pas été déposé.`,
        404
      );
    }

    const buffer = await getStorage().getBuffer(key);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(buffer.length),
        // Privé : le visuel ne doit pas être mis en cache par un intermédiaire.
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    return apiError(err, "GET /api/forces/[number]/[page]/preview");
  }
}
