import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {

  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const settings = await prisma.globalSettings.findFirst();

    if (!settings) {
      return NextResponse.json({ error: "Global settings not found" }, { status: 404 });
    }
    return NextResponse.json(settings);

  } 
  
  catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Impossible de récupérer les settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {

  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const data = await req.json();
    const { ambassadorAccounts } = data;

    if (ambassadorAccounts === undefined) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    const settings = await prisma.globalSettings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: "Global settings not found" }, { status: 404 });
    }

    const updated = await prisma.globalSettings.update({
      where: { id: settings.id },
      data: { ambassadorAccounts },
    });

    return NextResponse.json(updated);
  } 
  
  catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Impossible de mettre à jour les settings" }, { status: 500 });
  }
  
}
