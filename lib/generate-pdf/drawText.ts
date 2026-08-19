// Primitives de dessin partagées par toutes les pages du livrable

import { pxToPt, type MaskBox, type TextBox } from "./overlayLayout";

/// Recouvre une zone du gabarit d'un aplat, avant d'écrire par-dessus.
/// Sert à neutraliser un reste d'exemple laissé dans un gabarit du client.
export function drawMask(doc: PDFKit.PDFDocument, mask: MaskBox) {
  doc
    .rect(pxToPt(mask.xPx), pxToPt(mask.yPx), pxToPt(mask.widthPx), pxToPt(mask.heightPx))
    .fill(mask.color);
}

/// Écrit un texte dans une zone, en réduisant la police si nécessaire.
///
/// Les prénoms longs, les titres de force et certains rôles symboliques
/// débordent de la zone prévue dans le gabarit : on rétrécit progressivement
/// plutôt que de laisser le texte chevaucher un élément déjà dessiné dans
/// l'image.
export function drawInBox(doc: PDFKit.PDFDocument, text: string, box: TextBox) {
  if (!text) return;

  const maxWidth = pxToPt(box.maxWidthPx);
  let size = box.fontSizePt;

  doc.font(box.font).fontSize(size);
  while (doc.widthOfString(text) > maxWidth && size > box.minFontSizePt) {
    size -= 0.5;
    doc.fontSize(size);
  }

  // Le centrage est calculé ici plutôt que délégué à `align: "center"` de
  // pdfkit : sans retour à la ligne, l'alignement dépend d'une largeur de ligne
  // que pdfkit ne renseigne pas toujours. Positionner soi-même est prévisible.
  const left =
    box.align === "center"
      ? pxToPt(box.xPx) - doc.widthOfString(text) / 2
      : pxToPt(box.xPx);

  doc.fillColor(box.color).text(text, left, pxToPt(box.yPx), {
    lineBreak: false,
    // `alphabetic` fait de yPx la ligne de base ; sans l'option, pdfkit place
    // le bord haut de la ligne (voir VerticalAnchor dans overlayLayout.ts).
    ...(box.anchor === "baseline" ? { baseline: "alphabetic" as const } : {}),
  });
}

/// Pose un visuel pleine page. Les gabarits sont déjà au format A4 : ils
/// couvrent la page exactement, sans marge ni recadrage.
export function drawFullPageImage(doc: PDFKit.PDFDocument, image: Buffer) {
  doc.image(image, 0, 0, { width: doc.page.width, height: doc.page.height });
}
