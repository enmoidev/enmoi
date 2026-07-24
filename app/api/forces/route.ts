// Liste des 100 forces avec leur état de complétude

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError } from "@/lib/api/apiError";
import { isForceComplete } from "@/types/modelPrisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const forces = await prisma.force.findMany({
      orderBy: { number: "asc" },
    });

    const completeCount = forces.filter(isForceComplete).length;

    return NextResponse.json({
      forces,
      summary: {
        total: forces.length,
        complete: completeCount,
        incomplete: forces.length - completeCount,
      },
    });
  } catch (err) {
    return apiError(err, "GET /api/forces");
  }
}
