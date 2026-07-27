// Assemblage du livrable : pages d'introduction puis 2 pages par force

import PDFDocument from "pdfkit";
import { PdfData } from "@/types/pdf";
import { DEFAULT_FONT_PATH, registerFonts } from "./fonts";
import { drawFullPageDesign } from "./designAssets";
import { renderForcePages } from "./renderForcePages";
import { renderPage6 } from "./page6";

export async function generatePdf(data: PdfData): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", font: DEFAULT_FONT_PATH, margin: 0 });
  registerFonts(doc);

  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  // --- Pages d'introduction ---
  // Page 4 : fiche explicative, statique (le client la compose entièrement).
  drawFullPageDesign(doc, "page-4.png");

  // Page 6 : synthèse des 7 forces de la personne.
  doc.addPage();
  await renderPage6(
    doc,
    data.firstName,
    data.lastName,
    data.forces.map((force) => force.title)
  );

  // --- 2 pages par force ---
  for (const force of data.forces) {
    doc.addPage();
    renderForcePages(doc, force, data.firstName);
  }

  doc.end();
  return finished;
}
