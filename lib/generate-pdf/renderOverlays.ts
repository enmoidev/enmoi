// Surimpressions des pages d'introduction et des tableaux de travail
//
// Chaque fonction suppose le gabarit déjà posé sur la page courante : elle
// n'écrit que les valeurs propres à la personne.

import type { PdfData } from "@/types/pdf";
import type { PageOverlay } from "./deliverables";
import { drawInBox, drawMask } from "./drawText";
import {
  COVER_LAYOUTS,
  WHEEL_FIRST_NAME,
  WHEEL_FORCE_TITLES,
  OCHRE_BAND_FIRST_NAME,
  WORKSHEET_EVALUATION,
  WORKSHEET_MILIEU_DE_VIE,
  WORKSHEET_PLAN_ACTION,
  type WorksheetLayout,
} from "./overlayLayout";

/// Date de naissance au format de la maquette : « 04.07.1993 ».
/// L'entrée est une date ISO (YYYY-MM-DD) ; une chaîne vide reste vide, le
/// livrable pouvant être généré en mode test sans date.
function formatBirthDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return year && month && day ? `${day}.${month}.${year}` : "";
}

/// Heure de naissance au format de la maquette : « 14h25 ».
function formatBirthTime(time: string | undefined): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return hours && minutes ? `${hours}h${minutes}` : "";
}

/// Page 1 — prénom à la suite du libellé, date et heure dans leurs blancs.
function renderCover(doc: PDFKit.PDFDocument, data: PdfData) {
  const layout = COVER_LAYOUTS[data.deliverable];
  drawInBox(doc, data.firstName, layout.firstName);
  drawInBox(doc, formatBirthDate(data.birthDate), layout.birthDate);
  drawInBox(doc, formatBirthTime(data.birthTime), layout.birthTime);
}

/// Page 3 — le prénom au centre de la roue, un titre de force par pastille.
///
/// Les sept pastilles portent déjà le nom du rôle : le titre vient au-dessus,
/// dans l'ordre des positions. Une force absente laisse simplement sa pastille
/// avec le seul nom de rôle, ce que le gabarit prévoit.
function renderWheel(doc: PDFKit.PDFDocument, data: PdfData) {
  drawInBox(doc, data.firstName, WHEEL_FIRST_NAME);

  for (const force of data.forces) {
    const box = WHEEL_FORCE_TITLES[force.position - 1];
    if (box) drawInBox(doc, force.title, box);
  }
}

/// Pages 5 et 9/21 — prénom seul, en haut à gauche du bandeau ocre.
function renderOchreBand(doc: PDFKit.PDFDocument, data: PdfData) {
  drawInBox(doc, data.firstName, OCHRE_BAND_FIRST_NAME);
}

/// Tableaux de travail du livrable 2 : la seule colonne des forces.
/// Les champs « Mon Prénom » et « Date » de ces pages restent vides : ce sont
/// des lignes que la personne remplit elle-même.
function renderWorksheet(doc: PDFKit.PDFDocument, data: PdfData, layout: WorksheetLayout) {
  // Les masques d'abord : ils recouvrent un reste d'exemple du gabarit, et le
  // texte qui suit doit passer par-dessus.
  layout.masks?.forEach((mask) => drawMask(doc, mask));

  for (const force of data.forces) {
    const box = layout.forceTitles[force.position - 1];
    if (!box) continue;
    drawInBox(doc, layout.uppercase ? force.title.toUpperCase() : force.title, box);
  }
}

/// Applique la surimpression déclarée par le manifeste sur la page courante.
export function applyOverlay(doc: PDFKit.PDFDocument, overlay: PageOverlay, data: PdfData) {
  switch (overlay) {
    case "cover":
      return renderCover(doc, data);
    case "wheel":
      return renderWheel(doc, data);
    case "ochreBand":
      return renderOchreBand(doc, data);
    case "milieuDeVie":
      return renderWorksheet(doc, data, WORKSHEET_MILIEU_DE_VIE);
    case "evaluation":
      return renderWorksheet(doc, data, WORKSHEET_EVALUATION);
    case "planAction":
      return renderWorksheet(doc, data, WORKSHEET_PLAN_ACTION);
  }
}
