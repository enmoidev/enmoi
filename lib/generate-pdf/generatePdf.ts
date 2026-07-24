// Assemblage du PMI : pages d'introduction puis 2 pages par force

import PDFDocument from "pdfkit";
import { PdfData } from "@/types/pdf";
import { DEFAULT_FONT_PATH, registerFonts } from "./fonts";
import { renderForcePages } from "./renderForcePages";
import { renderPage5 } from "./page5";
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
  await renderPage5(doc, data.firstName, data.lastName, data.birthDate, data.birthPlace);

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
