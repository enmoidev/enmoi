import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";

const prisma = new PrismaClient();

export async function GET() {

  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const aptitudes = await prisma.aptitude.findMany({
      orderBy: { number: "asc" },
    });
    
    return NextResponse.json(aptitudes);

  } 
  
  catch (error) {

    console.error("Erreur GET /api/aptitudes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });

  }

}