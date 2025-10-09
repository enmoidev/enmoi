import PDFDocument from "pdfkit";
import path from "path";
import { renderAptitudeCard } from "./renderAptitudeCard";
import { PdfData } from "@/types/pdf";
import { renderPage5 } from "./page5";
import { renderPage6 } from "./page6";

export function generatePdf(data: PdfData): Promise<Buffer> {

  return new Promise((resolve, reject) => {

    const defaultFont = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-Regular.ttf");

    const doc = new PDFDocument({ size: "A4", font: defaultFont });

    const fontRegularAktiv = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-Regular.ttf");
    const fontBoldAktiv = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-XBold.ttf");
    const fontBoldItalicAktiv = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-XBoldItalic.ttf");
    const fontMediumAktiv = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-Medium.ttf");
    const fontMediumItalicAktiv = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-MediumItalic.ttf");
    const fontBoldPhilosopher = path.join(process.cwd(), "public", "fonts", "Philosopher-Bold.ttf");
    const fontSemiBoldAktiv = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-SemiBold.ttf");
    const fontItalicAktiv = path.join(process.cwd(), "public", "fonts", "AktivGrotesk-Italic.ttf");
    const fontRosaliaRegular = path.join(process.cwd(), "public", "fonts", "Rosalia.otf");

    doc.registerFont("regularAktiv", fontRegularAktiv);
    doc.registerFont("boldAktiv", fontBoldAktiv);
    doc.registerFont("boldItalicAktiv", fontBoldItalicAktiv);
    doc.registerFont("mediumAktiv", fontMediumAktiv);
    doc.registerFont("mediumItalicAktiv", fontMediumItalicAktiv);
    doc.registerFont("boldPhilosopher", fontBoldPhilosopher);
    doc.registerFont("semiboldAktiv", fontSemiBoldAktiv);
    doc.registerFont("italicAktiv", fontItalicAktiv);
    doc.registerFont("rosaliaRegular", fontRosaliaRegular);

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const aptitudesTitles = data.aptitudes.map(a => a.title);

    // === page 5 ===
    renderPage5(doc, data.firstName, data.lastName, data.birthDate, data.birthPlace);

    // === page 6 ===
    doc.addPage();
    renderPage6(doc, data.firstName, data.lastName, aptitudesTitles);

    // === Fiches des aptitudes ===
    doc.addPage();
    data.aptitudes.forEach((aptitude, index) => {

      renderAptitudeCard(doc, aptitude);

      if (index < data.aptitudes.length - 1) {
        doc.addPage();
      }
    });

    doc.end();
  });
}
