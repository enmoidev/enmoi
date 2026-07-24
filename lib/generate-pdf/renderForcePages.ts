// Rendu des 2 pages d'une force : le visuel en fond, puis les valeurs surimprimées

import type { PdfForce } from "@/types/pdf";
import {
  A4_HEIGHT_PT,
  A4_WIDTH_PT,
  PAGE_A_FIRST_NAME,
  PAGE_B_POSITION,
  PAGE_B_SYMBOLIC_ROLE,
  pxToPt,
  type TextBox,
} from "./overlayLayout";

/// Écrit un texte dans une zone, en réduisant la police si nécessaire.
///
/// Les prénoms longs et certains rôles symboliques débordent de la zone prévue
/// dans le gabarit : on rétrécit progressivement plutôt que de laisser le texte
/// chevaucher un élément déjà dessiné dans l'image.
function drawInBox(doc: PDFKit.PDFDocument, text: string, box: TextBox) {
  if (!text) return;

  const maxWidth = pxToPt(box.maxWidthPx);
  let size = box.fontSizePt;

  doc.font(box.font).fontSize(size);
  while (doc.widthOfString(text) > maxWidth && size > box.minFontSizePt) {
    size -= 0.5;
    doc.fontSize(size);
  }

  doc.fillColor(box.color).text(text, pxToPt(box.xPx), pxToPt(box.yPx), {
    width: maxWidth,
    lineBreak: false,
  });
}

/// Pose un visuel pleine page. Les visuels sont déjà au format A4 : ils couvrent
/// la page exactement, sans marge ni recadrage.
function drawFullPageImage(doc: PDFKit.PDFDocument, image: Buffer) {
  doc.image(image, 0, 0, { width: A4_WIDTH_PT, height: A4_HEIGHT_PT });
}

/// Rend les deux pages d'une force. L'appelant gère les sauts de page.
export function renderForcePages(
  doc: PDFKit.PDFDocument,
  force: PdfForce,
  firstName: string
) {
  // --- Page A : visuel + prénom dans le bandeau ---
  drawFullPageImage(doc, force.pageA);
  drawInBox(doc, firstName, PAGE_A_FIRST_NAME);

  // --- Page B : visuel + position et rôle symbolique ---
  doc.addPage();
  drawFullPageImage(doc, force.pageB);
  drawInBox(doc, String(force.position), PAGE_B_POSITION);
  drawInBox(doc, force.symbolicRole, PAGE_B_SYMBOLIC_ROLE);
}
