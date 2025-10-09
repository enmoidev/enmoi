import path from "path";
import { countCharacters, formatDateFR, simplifyNameForDesign } from "../utils";

export function renderPage5(doc: PDFKit.PDFDocument,firstName: string,lastName: string,birthDate: string,birthPlace: string
) {
  const turquoise_color = "#28939f";
  const pageWidth = doc.page.width;
  let y = 450;

  // === Fond de page ===
  const backgroundPath = path.resolve("./public/pdf-design/page-5.png");
  doc.image(backgroundPath, 0, 0, { width: doc.page.width, height: doc.page.height });

  // Texte "Carte personnelle de" + prénom/nom sur une seule ligne
  const labelText = "Carte personnelle de";
  const nameText = simplifyNameForDesign(`${firstName} ${lastName}`);

  // Calcul largeur pour centrer horizontalement
  doc.font("mediumAktiv").fontSize(19);
  const labelWidth = doc.widthOfString(labelText);
  const line1Height = doc.currentLineHeight();

  doc.font("rosaliaRegular").fontSize(18);
  const nameWidth = doc.widthOfString(nameText);

  const totalWidth = labelWidth + nameWidth;
  const startX = (pageWidth - totalWidth) / 2;

  // Ligne suivante : "né le {birthDate} à {birthPlace}"
  doc.font("italicAktiv").fontSize(17);
  const line2Height = doc.currentLineHeight();
  const blockHeight = line1Height + 5 + line2Height; // 5pt = espacement entre lignes

  // === Superposition du PNG de flèche ===
  const arrowPath = path.resolve("./public/pdf-design/Flèche-demi-cercle.png");
  const arrowOriginalWidth = 1702;
  const arrowOriginalHeight = 767;

  // Réduction de largeur tout en gardant les proportions
  const arrowScaleFactor = 0.3; // 70% de la largeur du bloc texte
  const arrowWidth = totalWidth * arrowScaleFactor;
  const arrowHeight = (arrowWidth * arrowOriginalHeight) / arrowOriginalWidth;

  // Ajuster la hauteur pour couvrir le bloc de texte
  const scaleY = blockHeight / arrowHeight;
  const finalArrowHeight = arrowHeight * scaleY + 5;

  const countCharactersName = countCharacters(`${firstName} ${lastName}`)
  
  // Centrer horizontalement par rapport au bloc texte
  const arrowX = startX + (totalWidth - arrowWidth) / 2;
  doc.image(arrowPath, arrowX-165-countCharactersName, y, { width: arrowWidth, height: finalArrowHeight });

  // === Dessiner le texte EXACTEMENT COMME AVANT ===
  // Label "Carte personnelle de"
  doc.font("mediumAktiv").fontSize(19).fillColor("black");
  doc.text(labelText, startX, y, { continued: true });

  // Prénom + Nom sur la même ligne, texte continu
  doc.font("rosaliaRegular").fontSize(18).fillColor(turquoise_color);
  doc.text(nameText, startX, y - 6);

  // Ligne suivante : "né le {birthDate} à {birthPlace}"
  const birthText = `né le ${formatDateFR(birthDate)} à ${birthPlace}`;
  y += line1Height + 12;
  doc.font("italicAktiv").fontSize(17).fillColor("black");
  doc.text(birthText, 190, y);
}
