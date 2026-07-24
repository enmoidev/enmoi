// Mise à jour du titre d'une force

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError, BusinessError } from "@/lib/api/apiError";
import { forceNumberSchema } from "@/lib/forces/forceAssets";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string }> };

const updateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre ne peut pas être vide.")
    .max(120, "Le titre ne peut pas dépasser 120 caractères."),
});

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { number } = await context.params;
    const forceNumber = forceNumberSchema.parse(number);

    const { title } = updateSchema.parse(await req.json());

    const force = await prisma.force.findUnique({ where: { number: forceNumber } });
    if (!force) {
      throw new BusinessError(`La force n° ${forceNumber} n'existe pas.`, 404);
    }

    const updated = await prisma.force.update({
      where: { id: force.id },
      data: { title },
    });

    return NextResponse.json({ force: updated });
  } catch (err) {
    return apiError(err, "PATCH /api/forces/[number]");
  }
}
