// Rendu des 2 pages d'une fiche de force : le visuel en fond, puis les valeurs surimprimées

import type { PdfForce } from "@/types/pdf";
import { drawFullPageImage, drawInBox } from "./drawText";
import {
  PAGE_A_FIRST_NAME,
  PAGE_A_FORCE_POSITION,
  PAGE_B_POSITION,
  PAGE_B_SYMBOLIC_ROLE,
} from "./overlayLayout";

/// Rend les deux pages d'une force. L'appelant a déjà ajouté la page A ; la
/// page B est ajoutée ici.
///
/// La fiche est obligatoire : c'est à l'appelant de n'appeler cette fonction
/// que pour les forces que le livrable développe.
export function renderForcePages(
  doc: PDFKit.PDFDocument,
  force: PdfForce & { sheet: NonNullable<PdfForce["sheet"]> },
  firstName: string
) {
  // --- Page A : visuel, prénom dans le bandeau, grand chiffre en bas ---
  drawFullPageImage(doc, force.sheet.pageA);
  drawInBox(doc, firstName, PAGE_A_FIRST_NAME);
  drawInBox(doc, String(force.position), PAGE_A_FORCE_POSITION);

  // --- Page B : visuel + position et rôle symbolique ---
  // Pas de prénom ici : il figure déjà sur la page A, juste avant.
  doc.addPage();
  drawFullPageImage(doc, force.sheet.pageB);
  drawInBox(doc, String(force.position), PAGE_B_POSITION);
  drawInBox(doc, force.symbolicRole, PAGE_B_SYMBOLIC_ROLE);
}
