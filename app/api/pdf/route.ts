// Génération d'un livrable (freemium, livrable 1 ou livrable 2)

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generatePdf } from "@/lib/generate-pdf/generatePdf";
import { DELIVERABLES, DELIVERABLE_IDS, pdfFileName } from "@/lib/generate-pdf/deliverables";
import {
  buildBirthVariables,
  evaluateForceNumber,
  FormulaError,
} from "@/lib/computeFunctions/computeFunctions";
import { type DeliverableId, type PdfData, type PdfForce } from "@/types/pdf";
import { describeRange, selectFormulaSet } from "@/lib/computeFunctions/formulaSets";
import { ROLE_COUNT, roleOverlayText } from "@/lib/forces/roles";
import { forceNumberSchema } from "@/lib/forces/forceAssets";
import { getAuthSession } from "@/lib/auth-utils/getAuthSession";
import { requireRole } from "@/lib/auth-utils/requireRole";
import { apiError, BusinessError } from "@/lib/api/apiError";
import { getStorage } from "@/lib/storage";

export const runtime = "nodejs";

// Jusqu'à 14 visuels à lire sur S3 puis 35 pages à assembler : la durée par
// défaut de Vercel est trop courte. À réévaluer avec les temps réellement
// mesurés en production, le livrable 2 étant le plus lourd.
export const maxDuration = 60;

const requestSchema = z.object({
  deliverable: z.enum(DELIVERABLE_IDS as [DeliverableId, ...DeliverableId[]]),
  firstName: z.string().trim().min(1, "Le prénom est obligatoire."),
  lastName: z.string().trim().min(1, "Le nom est obligatoire."),
  birthPlace: z.string().trim().min(1, "Le lieu de naissance est obligatoire."),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date de naissance doit être au format AAAA-MM-JJ.")
    .optional(),
  // Imprimée sur la couverture quand elle est connue. Aucune formule ne s'en
  // sert : elle sert à lever un doute humain sur la date, pas à être calculée.
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "L'heure de naissance doit être au format HH:MM.")
    .optional(),
  // Mode test : les 7 numéros de force sont choisis directement, au lieu d'être
  // calculés à partir de la date de naissance. Réservé au back-office pour valider
  // l'assemblage du livrable sans dépendre des formules.
  forceNumbers: z
    .array(forceNumberSchema)
    .length(7, "Il faut exactement 7 numéros de force.")
    .optional(),
});

/// Calcule les 7 numéros de force à partir de la date de naissance et des formules.
///
/// Le jeu de formules dépend de l'année de naissance : le client applique des
/// expressions différentes à certaines tranches : l'an 2000, puis 2001-2009.
async function computeForceNumbers(birthDate: string): Promise<number[]> {
  const date = new Date(birthDate);
  const variables = buildBirthVariables(date);

  const sets = await prisma.formulaSet.findMany({
    include: { functions: { orderBy: { number: "asc" } } },
  });

  if (sets.length === 0) {
    throw new BusinessError(
      "Aucun jeu de formules n'est enregistré. Complétez-les depuis /admin/formules."
    );
  }

  const set = selectFormulaSet(sets, date.getFullYear());
  const formulas = set.functions;

  if (formulas.length !== ROLE_COUNT) {
    throw new BusinessError(
      `${ROLE_COUNT} formules sont attendues pour le jeu « ${set.label} » ` +
        `(${describeRange(set)}), ${formulas.length} sont enregistrées. ` +
        `Complétez-les depuis /admin/formules.`
    );
  }

  // Chaque formule donne le numéro de la force occupant sa position.
  // Ce numéro sert uniquement à retrouver le visuel : il n'est jamais imprimé.
  return formulas.map((formula, index) =>
    evaluateForceNumber(formula.expression, variables, index + 1)
  );
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    requireRole(session, ["ADMIN"]);

    const {
      deliverable: deliverableId,
      firstName,
      lastName,
      birthPlace,
      birthDate,
      birthTime,
      forceNumbers: chosenNumbers,
    } = requestSchema.parse(await req.json());

    const deliverable = DELIVERABLES[deliverableId];

    // Deux modes : soit les numéros sont fournis (test), soit ils sont calculés
    // à partir de la date de naissance.
    let forceNumbers: number[];
    if (chosenNumbers) {
      forceNumbers = chosenNumbers;
    } else {
      if (!birthDate) {
        throw new BusinessError(
          "Fournissez une date de naissance, ou choisissez les 7 forces manuellement."
        );
      }
      forceNumbers = await computeForceNumbers(birthDate);
    }

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

      // Les 7 forces sont toujours nommées — la roue de la page 3 les liste
      // toutes — mais seules celles que le livrable développe ont besoin de
      // leurs deux visuels. Le freemium n'en détaille qu'une : inutile de lire
      // six fiches sur S3 pour les jeter ensuite.
      const isDetailed = position <= deliverable.detailedForceCount;

      if (isDetailed && (!force.pageAKey || !force.pageBKey)) {
        // Échec explicite plutôt qu'un livrable silencieusement incomplet.
        const missing = !force.pageAKey ? "A" : "B";
        throw new BusinessError(
          `Le visuel de la page ${missing} manque pour la force n° ${forceNumber} ` +
            `(« ${force.title} »), en position ${position}. Déposez-le depuis /admin/forces.`
        );
      }

      const sheet =
        isDetailed && force.pageAKey && force.pageBKey
          ? await Promise.all([
              storage.getBuffer(force.pageAKey),
              storage.getBuffer(force.pageBKey),
            ]).then(([pageA, pageB]) => ({ pageA, pageB }))
          : undefined;

      pdfForces.push({
        number: force.number,
        title: force.title,
        position,
        symbolicRole: roleOverlayText(position),
        sheet,
      });
    }

    const pdfData: PdfData = {
      deliverable: deliverableId,
      firstName,
      lastName,
      birthPlace,
      // En mode test, la date de naissance peut être absente : la couverture
      // laisse alors le blanc vide, sans incidence sur le reste du document.
      birthDate: birthDate ?? "",
      birthTime,
      forces: pdfForces,
    };
    const pdfBuffer = await generatePdf(pdfData);

    const fileName = pdfFileName(DELIVERABLES[deliverableId], firstName, lastName);

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
