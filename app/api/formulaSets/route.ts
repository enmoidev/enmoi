// Jeux de formules — liste
//
// Les jeux ne se créent ni ne se suppriment depuis l'application : ils sont
// posés par migration. Il y en a deux, le jeu par défaut et celui des naissances
// 2000-2009, seul cas particulier connu. Un futur cas se traitera de la même
// façon — une migration — plutôt qu'en confiant à l'administrateur une gestion
// de tranches qu'il n'aurait à utiliser qu'une fois tous les deux ans.
//
// Seules les expressions sont modifiables, via /api/mathFunctions/[id].

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError } from "@/lib/api/apiError";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const sets = await prisma.formulaSet.findMany({
      include: { functions: { orderBy: { number: "asc" } } },
      // Le jeu par défaut d'abord (bornes nulles), puis les tranches par année.
      orderBy: [{ yearFrom: { sort: "asc", nulls: "first" } }],
    });

    return NextResponse.json({ sets });
  } catch (err) {
    return apiError(err, "GET /api/formulaSets");
  }
}
