import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";

const prisma = new PrismaClient();

export async function GET() {

  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);
    
    const functions = await prisma.mathFunction.findMany({
      orderBy: { number: "asc" },
    });

    return NextResponse.json(functions);
    
  } 
  
  catch (error) {
    console.error("Erreur GET /api/mathFunctions:", error);
    return NextResponse.json({ error: "Impossible de récupérer les fonctions" }, { status: 500 });
  }
  
}