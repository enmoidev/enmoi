import { fitTextToWidth } from "../utils";
import { loadDesignAsset } from "./designAssets";

/**
 * Dessine le titre d'une force dans un rectangle arrondi adaptatif
 */
function drawForce(
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

export async function renderPage6(doc: PDFKit.PDFDocument, firstName: string, lastName: string, forceTitles: string[]) {

  const backgroundImageBuffer = loadDesignAsset("page-6.png");

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

  // === Titre "Mes 7 Forces Mentales" ===
  y += doc.currentLineHeight() + 10;
  const titleText = "Mes 7 Forces Mentales";
  doc.font("boldPhilosopher").fontSize(15).fillColor("white");
  const titleWidth = doc.widthOfString(titleText);
  const titleX = (pageWidth - titleWidth) / 2 + offsetX;
  doc.text(titleText, titleX, y);

  // === Positions ===
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2 + 20;

  const positions = [
    { x: centerX, y: centerY - 120 },    // force 0 (centrée)
    { x: centerX + 95, y: centerY - 63 }, // force 1 (fixLeft)
    { x: centerX + 115, y: centerY + 45 }, // force 2 (fixLeft)
    { x: centerX + 45, y: centerY + 130 }, // force 3 (fixLeft)
    { x: centerX - 35, y: centerY + 130 },  // force 4 (fixRight)
    { x: centerX - 105, y: centerY + 40 },  // force 5 (fixRight)
    { x: centerX - 80, y: centerY - 65 },  // force 6 (fixRight)
  ];

  forceTitles.forEach((title, i) => {
    const pos = positions[i];

    if (i === 1 || i === 2 || i === 3) {
      // Bords gauche fixes
      drawForce(doc, title, pos.x, pos.y, {
        turquoiseColor: turquoise_color,
        fontSize: 14,
        fixLeft: pos.x,
      });
    } else if (i === 4 || i === 5 || i === 6) {
      // Bords droits fixes
      drawForce(doc, title, pos.x, pos.y, {
        turquoiseColor: turquoise_color,
        fontSize: 14,
        fixRight: pos.x,
      });
    } else {
      // Centré (force 0)
      drawForce(doc, title, pos.x, pos.y, {
        turquoiseColor: turquoise_color,
        fontSize: 14,
      });
    }
  });
}
