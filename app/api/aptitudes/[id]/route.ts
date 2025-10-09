
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";

const prisma = new PrismaClient();

export async function GET(req: Request) {

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const aptitude = await prisma.aptitude.findUnique({
      where: { id },
    });

    if (!aptitude) {
      return NextResponse.json({ error: "Aptitude non trouvée" }, { status: 404 });
    }

    return NextResponse.json(aptitude);
  } 
  
  catch (error) {
    console.error("Erreur GET /api/aptitudes/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

}

export async function PUT(req: Request) {

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const data = await req.json();

    const updated = await prisma.aptitude.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } 
  
  catch (error) {
    console.error("Erreur PUT /api/aptitudes/[id]:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" },{ status: 500 });
  }
  
}

