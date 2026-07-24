// Génération du PMI complet

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generatePdf } from "@/lib/generate-pdf/generatePdf";
import {
  buildBirthVariables,
  evaluateForceNumber,
  FormulaError,
} from "@/lib/computeFunctions/computeFunctions";
import { SYMBOLIC_ROLES, type PdfData, type PdfForce } from "@/types/pdf";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError, BusinessError } from "@/lib/api/apiError";
import { getStorage } from "@/lib/storage";

export const runtime = "nodejs";

// 14 visuels à lire puis à assembler : la durée par défaut de Vercel est trop
// courte. À réévaluer avec les temps réellement mesurés en production.
export const maxDuration = 60;

const requestSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est obligatoire."),
  lastName: z.string().trim().min(1, "Le nom est obligatoire."),
  birthPlace: z.string().trim().min(1, "Le lieu de naissance est obligatoire."),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date de naissance doit être au format AAAA-MM-JJ."),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const { firstName, lastName, birthPlace, birthDate } = requestSchema.parse(
      await req.json()
    );

    const variables = buildBirthVariables(new Date(birthDate));

    const formulas = await prisma.mathFunction.findMany({
      orderBy: { number: "asc" },
    });

    if (formulas.length !== SYMBOLIC_ROLES.length) {
      throw new BusinessError(
        `${SYMBOLIC_ROLES.length} formules sont attendues, ${formulas.length} sont enregistrées. ` +
          `Complétez-les depuis /admin/formules.`
      );
    }

    // Chaque formule donne le numéro de la force occupant sa position.
    // Ce numéro sert uniquement à retrouver le visuel : il n'est jamais imprimé.
    const forceNumbers = formulas.map((formula, index) =>
      evaluateForceNumber(formula.expression, variables, index + 1)
    );

    const forces = await prisma.force.findMany({
      where: { number: { in: forceNumbers } },
    });
    const forcesByNumber = new Map(forces.map((force) => [force.number, force]));

    const storage = getStorage();
    const pdfForces: PdfForce[] = [];

    for (const [index, forceNumber] of forceNumbers.entries()) {
      const position = index + 1;
      const force = forcesByNumber.get(forceNumber);

      if (!force) {
        throw new BusinessError(
          `La force n° ${forceNumber}, attendue en position ${position}, n'existe pas.`
        );
      }

      // Échec explicite plutôt qu'un PMI silencieusement incomplet.
      if (!force.pageAKey || !force.pageBKey) {
        const missing = !force.pageAKey ? "A" : "B";
        throw new BusinessError(
          `Le visuel de la page ${missing} manque pour la force n° ${forceNumber} ` +
            `(« ${force.title} »), en position ${position}. Déposez-le depuis /admin/forces.`
        );
      }

      const [pageA, pageB] = await Promise.all([
        storage.getBuffer(force.pageAKey),
        storage.getBuffer(force.pageBKey),
      ]);

      pdfForces.push({
        number: force.number,
        title: force.title,
        position,
        symbolicRole: SYMBOLIC_ROLES[index],
        pageA,
        pageB,
      });
    }

    const pdfData: PdfData = {
      firstName,
      lastName,
      birthPlace,
      birthDate,
      forces: pdfForces,
    };
    const pdfBuffer = await generatePdf(pdfData);

    const fileName = `PMI_${firstName}_${lastName}.pdf`.replace(/[^\w.-]/g, "_");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.length),
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    // Une formule invalide relève de la configuration : l'administrateur doit
    // voir le message pour corriger l'expression fautive.
    if (err instanceof FormulaError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return apiError(err, "POST /api/pdf");
  }
}
