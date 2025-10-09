import { NextResponse } from "next/server";
import { generateAptitudeCardPDF } from "@/lib/generate-pdf/generateAptitudeCardPDF";
import { PdfAptitude } from "@/types/pdf";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";

// Indique à Next.js d'utiliser Node.js au lieu de Edge
export const runtime = "nodejs";

export async function POST(req: Request) {
  
  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const data:PdfAptitude = await req.json();
    const pdfBuffer = await generateAptitudeCardPDF(data);

    const pdfBufferFromServer  = Buffer.from(pdfBuffer);

    return new NextResponse(pdfBufferFromServer , {
      headers: { "Content-Type": "application/pdf" },
    });
  } 
  
  catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Impossible de générer le PDF" },{ status: 500 });
  }
}