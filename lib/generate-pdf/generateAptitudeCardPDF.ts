import PDFDocument from "pdfkit";
import path from "path";
import { renderAptitudeCard } from "./renderAptitudeCard";
import { PdfAptitude } from "@/types/pdf";

export async function generateAptitudeCardPDF(data: PdfAptitude): Promise<Buffer> {

  return new Promise<Buffer>(async (resolve, reject) => {

    try {

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

    // === Fiche aptitude ===
    await renderAptitudeCard(doc, data);

    doc.end();
    }
    catch(err){
      reject(err)
    }
  });
}
