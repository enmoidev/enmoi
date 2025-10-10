import path from "path";
import { fitTextToWidth } from "../utils";
import axios from "axios";
import fs from "fs";

/**
 * Dessine une aptitude dans un rounded rectangle adaptatif
 */
function drawAptitude(
  doc: PDFKit.PDFDocument,
  text: string,
  posX: number,
  posY: number,
  options: { fixLeft?: number; fixRight?: number; fontSize?: number; turquoiseColor?: string } = {}
) {
  const turquoise = options.turquoiseColor || "#28939f";
  const fontSize = options.fontSize || 14;
  const paddingX = 7;
  const paddingY = 4;

  doc.font("boldPhilosopher").fontSize(fontSize);
  const textWidth = doc.widthOfString(text);
  const textHeight = doc.currentLineHeight();
  const rectWidth = textWidth + paddingX * 2;
  const rectHeight = textHeight + paddingY * 2;
  const rectRadius = 12;

  // Position par défaut : centré
  let rectX = posX - rectWidth / 2;

  // Si fixLeft ou fixRight définis → priorité
  if (options.fixLeft !== undefined) {
    rectX = options.fixLeft;
  } else if (options.fixRight !== undefined) {
    rectX = options.fixRight - rectWidth;
  }

  const rectY = posY - rectHeight / 2;

  // Rectangle
  doc.roundedRect(rectX, rectY, rectWidth, rectHeight, rectRadius).fill(turquoise);

  // Texte centré dans le rect
  doc.fillColor("white").text(text, rectX, rectY + paddingY, {
    width: rectWidth,
    height: rectHeight - paddingY * 2,
    align: "center",
  });
}

export async function renderPage6(doc: PDFKit.PDFDocument, firstName: string, lastName: string, aptitudesTitle: string[]) {

  const isProd = process.env.NODE_ENV === "production";

  let backgroundImageBuffer: Buffer;

  if (isProd) {

    const backgroundImageUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://www.myinyou.com"}/pdf-design/page-6.png`;
    const responseImageBackgroundUrl = await axios.get(backgroundImageUrl, { responseType: "arraybuffer" });
    backgroundImageBuffer = Buffer.from(responseImageBackgroundUrl.data);

  } 
  
  else {

    const localPathBackgroundImage = path.resolve("./public/pdf-design/page-6.png");
    backgroundImageBuffer = fs.readFileSync(localPathBackgroundImage);

  }

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  let y = 420;
  const turquoise_color = "#28939f";

  // === Fond de page ===
  doc.image(backgroundImageBuffer, 0, 0, { width: pageWidth, height: pageHeight });

  // === Prénom + Nom ===
  const offsetX = 6;
  const nameText = `${firstName} ${lastName}`;
  const maxWidth = pageWidth - 400;
  const adaptedSize = fitTextToWidth(doc, nameText, "rosaliaRegular", maxWidth, 20, 12);

  doc.font("rosaliaRegular").fontSize(adaptedSize).fillColor("white");
  const nameWidth = doc.widthOfString(nameText);
  const nameX = (pageWidth - nameWidth) / 2 + offsetX;
  doc.text(nameText, nameX, y);

  // === Titre "Mes 7 Aptitudes" ===
  y += doc.currentLineHeight() + 10;
  const titleText = "Mes 7 Aptitudes";
  doc.font("boldPhilosopher").fontSize(15).fillColor("white");
  const titleWidth = doc.widthOfString(titleText);
  const titleX = (pageWidth - titleWidth) / 2 + offsetX;
  doc.text(titleText, titleX, y);

  // === Positions ===
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2 + 20;

  const positions = [
    { x: centerX, y: centerY - 120 },    // aptitude 0 (centrée)
    { x: centerX + 95, y: centerY - 63 }, // aptitude 1 (fixLeft)
    { x: centerX + 115, y: centerY + 45 }, // aptitude 2 (fixLeft)
    { x: centerX + 45, y: centerY + 130 }, // aptitude 3 (fixLeft)
    { x: centerX - 35, y: centerY + 130 },  // aptitude 4 (fixRight)
    { x: centerX - 105, y: centerY + 40 },  // aptitude 5 (fixRight)
    { x: centerX - 80, y: centerY - 65 },  // aptitude 6 (fixRight)
  ];

  aptitudesTitle.forEach((aptitude, i) => {
    const pos = positions[i];

    if (i === 1 || i === 2 || i === 3) {
      // Bords gauche fixes
      drawAptitude(doc, aptitude, pos.x, pos.y, {
        turquoiseColor: turquoise_color,
        fontSize: 14,
        fixLeft: pos.x,
      });
    } else if (i === 4 || i === 5 || i === 6) {
      // Bords droits fixes
      drawAptitude(doc, aptitude, pos.x, pos.y, {
        turquoiseColor: turquoise_color,
        fontSize: 14,
        fixRight: pos.x,
      });
    } else {
      // Centré (aptitude 0)
      drawAptitude(doc, aptitude, pos.x, pos.y, {
        turquoiseColor: turquoise_color,
        fontSize: 14,
      });
    }
  });
}
