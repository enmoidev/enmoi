// Dépôt et suppression d'un visuel de force (page A ou B)

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError, BusinessError } from "@/lib/api/apiError";
import { getStorage } from "@/lib/storage";
import {
  forceAssetKey,
  forceNumberSchema,
  forcePageSchema,
  validateForceImage,
  type ForcePage,
} from "@/lib/forces/forceAssets";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string; page: string }> };

/// Valide les segments d'URL et s'assure que la force existe.
async function resolveTarget(context: RouteContext) {
  const { number, page } = await context.params;
  const forceNumber = forceNumberSchema.parse(number);
  const forcePage = forcePageSchema.parse(page) as ForcePage;

  const force = await prisma.force.findUnique({ where: { number: forceNumber } });
  if (!force) {
    throw new BusinessError(`La force n° ${forceNumber} n'existe pas.`, 404);
  }

  return { force, forceNumber, forcePage };
}

/// Colonnes à mettre à jour selon la page visée.
function assetColumns(page: ForcePage) {
  return page === "a"
    ? { keyColumn: "pageAKey" as const, filenameColumn: "pageAFilename" as const }
    : { keyColumn: "pageBKey" as const, filenameColumn: "pageBFilename" as const };
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { force, forcePage } = await resolveTarget(context);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new BusinessError("Aucun fichier reçu.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // On valide le contenu réel du fichier, pas son extension ni le type MIME
    // annoncé par le navigateur, tous deux falsifiables.
    const validation = validateForceImage(buffer);
    if (!validation.ok) {
      throw new BusinessError(validation.reason);
    }

    const key = forceAssetKey(force.id, forcePage);
    await getStorage().put(key, buffer, "image/png");

    const { keyColumn, filenameColumn } = assetColumns(forcePage);
    const updated = await prisma.force.update({
      where: { id: force.id },
      data: {
        [keyColumn]: key,
        [filenameColumn]: file.name,
      },
    });

    return NextResponse.json({ force: updated });
  } catch (err) {
    return apiError(err, "POST /api/forces/[number]/[page]");
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { force, forcePage } = await resolveTarget(context);

    const { keyColumn, filenameColumn } = assetColumns(forcePage);

    // On supprime la clé réellement enregistrée plutôt que de la reconstruire :
    // c'est la seule qui soit sûrement celle de l'objet déposé.
    const storedKey = force[keyColumn];
    if (storedKey) {
      await getStorage().remove(storedKey);
    }
    const updated = await prisma.force.update({
      where: { id: force.id },
      data: {
        [keyColumn]: null,
        [filenameColumn]: null,
      },
    });

    return NextResponse.json({ force: updated });
  } catch (err) {
    return apiError(err, "DELETE /api/forces/[number]/[page]");
  }
}
