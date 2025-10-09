import { NextResponse } from "next/server";
import { generatePdf } from "@/lib/generate-pdf/generatePdf";
import { PrismaClient } from "@prisma/client";
import { evaluateFormula } from "@/lib/computeFunctions/computeFunctions";
import { PdfAptitude, PdfData } from "@/types/pdf";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: Request) {

  try {

    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const data = await req.json();
    const { firstName, lastName, birthPlace, birthDate } = data;

    if (!firstName || !lastName || !birthPlace || !birthDate) {
      return NextResponse.json(
        { error: "Veuillez fournir toutes les informations" },
        { status: 400 }
      );
    }

    // --- Calcul des composantes de la date de naissance ---
    const birth = new Date(birthDate);
    const day = birth.getDate();
    const month = birth.getMonth() + 1;
    const year = birth.getFullYear();

    const yearStr = year.toString().padStart(4, "0");
    const year1 = Number(yearStr[0]);
    const year2 = Number(yearStr[1]);
    const year3 = Number(yearStr[2]);
    const year4 = Number(yearStr[3]);

    const dayStr = day.toString().padStart(2, "0");
    const day1 = Number(dayStr[0]);
    const day2 = Number(dayStr[1]);

    const monthStr = month.toString().padStart(2, "0");
    const month1 = Number(monthStr[0]);
    const month2 = Number(monthStr[1]);

    // --- Récupérer toutes les aptitudes d’un coup pour optimiser la DB ---
    const allAptitudes = await prisma.aptitude.findMany();

    // --- Récupérer toutes les formules de fonctions ---
    const functions = await prisma.mathFunction.findMany({
      orderBy: { number: "asc" }, 
    });

    // --- Calculer les nombres et associer les aptitudes correspondantes ---
    const aptitudes: PdfAptitude[] = [];

    const symbolicRoleArray = ["Ta colonne vertébrale","Ta boussole","Ta destination","Ton moteur","Ta vitrine","Ton énergie générationnelle","Ton inspiratrice"]

    for (let i = 0; i < functions.length; i++) {

      const func = functions[i];

      const num = evaluateFormula(func.expression,day,month,year,year1,year2,year3,year4,day1,day2,month1,month2) ?? 0;

      const aptitude = allAptitudes.find(a => a.number === num);

      // to test, choice first seven aptitudes
      //const aptitude = allAptitudes.find(a => a.number === i+1);

      if (aptitude){
        const aptitudeWithsymbolicRole:PdfAptitude = {...aptitude,symbolicRole: symbolicRoleArray[i]};
        aptitudes.push(aptitudeWithsymbolicRole);
      } 

    }

    // --- Préparer les données pour le PDF ---
    const pdfData:PdfData = {firstName,lastName,birthPlace,birthDate,aptitudes};

    //console.log(pdfData)

    const pdfBuffer = await generatePdf(pdfData);
    const pdfBufferFromServer = Buffer.from(pdfBuffer);

    return new NextResponse(pdfBufferFromServer, {
      headers: { "Content-Type": "application/pdf" },
    });

  } 
  
  catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Impossible de générer le PDF" },{ status: 500 }
    );
  }
}
