// Assemblage d'un livrable : le manifeste déroulé page à page

import PDFDocument from "pdfkit";
import type { PdfData } from "@/types/pdf";
import { DEFAULT_FONT_PATH, registerFonts } from "./fonts";
import { DELIVERABLES, type DeliverablePage } from "./deliverables";
import { drawFullPageDesign } from "./designAssets";
import { applyOverlay } from "./renderOverlays";
import { renderForcePages } from "./renderForcePages";

export async function generatePdf(data: PdfData): Promise<Buffer> {
  const deliverable = DELIVERABLES[data.deliverable];

  // `autoFirstPage: false` : chaque page est ajoutée explicitement par le
  // parcours du manifeste, sinon le document s'ouvre sur une page vide.
  const doc = new PDFDocument({
    size: "A4",
    font: DEFAULT_FONT_PATH,
    margin: 0,
    autoFirstPage: false,
  });
  registerFonts(doc);

  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const drawPage = (page: DeliverablePage) => {
    doc.addPage();
    drawFullPageDesign(doc, page.asset);
    if (page.overlay) applyOverlay(doc, page.overlay, data);
  };

  deliverable.before.forEach(drawPage);

  // Les fiches développées sont les premières positions : le freemium n'en
  // montre qu'une, les livrables 1 et 2 les sept.
  for (const force of data.forces.slice(0, deliverable.detailedForceCount)) {
    if (!force.sheet) {
      // L'appelant garantit les visuels des forces développées. Si l'invariant
      // casse, mieux vaut s'arrêter que produire un livrable amputé sans le dire.
      throw new Error(
        `Les visuels de la force n° ${force.number} (« ${force.title} »), en ` +
          `position ${force.position}, n'ont pas été chargés.`
      );
    }
    doc.addPage();
    renderForcePages(doc, { ...force, sheet: force.sheet }, data.firstName);
  }

  deliverable.after.forEach(drawPage);

  doc.end();
  return finished;
}
