// === FICHE DES APTITUDES ===

import { PdfAptitude } from "@/types/pdf";
import path from "path";
import fs from "fs";
import axios from "axios";

export async function renderAptitudeCard(doc: PDFKit.PDFDocument, data: PdfAptitude) {

  const turquoise_color = "#28939f";
  const pageWidth = doc.page.width;
  let y = 75;
  
  const isProd = process.env.NODE_ENV === "production";

  let backgroundImageBuffer: Buffer;
  let arrowImageBuffer: Buffer;
  let keywordsImageBuffer: Buffer;

  if (isProd) {

    const backgroundImageUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://www.myinyou.com"}/pdf-design/fiche-aptitude.png`;
    const responseImageBackgroundUrl = await axios.get(backgroundImageUrl, { responseType: "arraybuffer" });
    backgroundImageBuffer = Buffer.from(responseImageBackgroundUrl.data);

    const arrowImageUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://www.myinyou.com"}/pdf-design/Flèche-texte-emblématique.png`;
    const responseArrowImageUrl = await axios.get(arrowImageUrl, { responseType: "arraybuffer" });
    arrowImageBuffer = Buffer.from(responseArrowImageUrl.data);

    const keywordsImageUrl = `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://www.myinyou.com"}/pdf-design/Design-mots-clés.png`;
    const responseKeywordsImageUrl = await axios.get(keywordsImageUrl, { responseType: "arraybuffer" });
    keywordsImageBuffer = Buffer.from(responseKeywordsImageUrl.data);

  } 
  
  else {

    const localPathBackgroundImage = path.resolve("./public/pdf-design/fiche-aptitude.png");
    backgroundImageBuffer = fs.readFileSync(localPathBackgroundImage);

    const localPathArrowImage = path.resolve("./public/pdf-design/Flèche-texte-emblématique.png");
    arrowImageBuffer = fs.readFileSync(localPathArrowImage);

    const localPathKeyWordsImage = path.resolve("./public/pdf-design/Design-mots-clés.png");
    keywordsImageBuffer = fs.readFileSync(localPathKeyWordsImage);

  }

  doc.image(backgroundImageBuffer, 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });

  // 1. Titre principal
  doc.font("boldPhilosopher").fontSize(35).fillColor("white").text(`${data.title || ""}`, 0, y, { width: pageWidth, align: "center" });

  // 2. Rôle symbolique
  const label = "Rôle Symbolique :";
  const value = ` ${data.symbolicRole}`;
  y = y + 40;

  doc.font("boldAktiv").fontSize(14);
  const labelWidth = doc.widthOfString(label);

  doc.font("boldItalicAktiv").fontSize(14);
  const valueWidth = doc.widthOfString(value);

  const totalWidth = labelWidth + valueWidth;
  let startX = (pageWidth - totalWidth) / 2;

  doc.font("boldAktiv").fillColor("white");
  doc.text(label, startX, y, { continued: false });

  doc.font("boldItalicAktiv").fillColor("white");
  doc.text(value, startX + labelWidth, y);

  // 3. Définition vivante
  let textWidth = (pageWidth * 2) / 3.6;
  y = y + 70;
  startX = (pageWidth - textWidth) / 2; // centrage parfait

  const segments: { text: string; color: string }[] = [];
  let lastIndex = 0;
  const regex = /«(.*?)»/g;
  let match;

  while ((match = regex.exec(data.livingDefinition)) !== null) {

    const before = data.livingDefinition.slice(lastIndex, match.index);
    if (before) segments.push({ text: before, color: "black" });

    segments.push({ text: "«", color: "black" });
    segments.push({ text: match[1], color: turquoise_color });
    segments.push({ text: "» ", color: "black" });

    lastIndex = regex.lastIndex;
  }

  const after = data.livingDefinition.slice(lastIndex);
  if (after) segments.push({ text: after, color: "black" });

  doc.font("semiboldAktiv").fontSize(12);
  segments.forEach((seg, i) => {
    const isLastSegment = i === segments.length - 1;
    doc.fillColor(seg.color).text(seg.text, startX, y, {
      width: textWidth,
      align: "justify",
      continued: !isLastSegment,
      lineGap: 1,
    });
  });

  // 4. Texte emblématique
  y = y + 80;
  doc.font("semiboldAktiv").fontSize(17).fillColor(turquoise_color);

  const labelText = "Texte emblématique";
  const labelWidthActual = doc.widthOfString(labelText);
  const labelX = (pageWidth - labelWidthActual) / 2;
  const labelY = y;

  const desiredWidth = labelWidthActual + 50;
  const originalWidth = 1751;
  const originalHeight = 384;
  const desiredHeight = (desiredWidth * originalHeight) / originalWidth;
  const imageX = labelX + labelWidthActual / 2 - desiredWidth / 2;
  const imageY = labelY + doc.currentLineHeight() / 2 - desiredHeight / 2;
  doc.image(arrowImageBuffer, imageX, imageY, { width: desiredWidth, height: desiredHeight });

  doc.text(labelText, labelX, labelY);

  // Texte emblématique (paragraphe + cadre pointillé)
  const paddingText = 15;
  const frameLeft = 30;
  const frameRight = pageWidth - 30;
  const textTop = doc.y + 15;
  textWidth = frameRight - frameLeft - 2 * paddingText;
  const textX = frameLeft + paddingText;

  doc.font("regularAktiv").fontSize(12).fillColor("black");
  let currentY = textTop;
  const textLines = data.emblematicText.split("\n");
  for (const paragraph of textLines) {
    if (!paragraph.trim()) continue;
    doc.text(paragraph, textX, currentY, {
      width: textWidth,
      align: "justify",
      lineGap: 1,
    });
    currentY = doc.y + 10;
  }
  const frameBottom = currentY + 5;

  // === Encadré en pointillés avec coins arrondis ===
  doc.save();
  const radius = 15;
  const gap = 9;
  const size = 3.2;
  doc.fillColor(turquoise_color);

  const imageMiddleY = imageY + desiredHeight / 2;
  const padding = 20;
  const x = frameLeft;
  const yRect = imageMiddleY;
  const width = frameRight - frameLeft;
  const height = frameBottom - imageMiddleY;

  function drawPointsLine(x1: number, y1: number, x2: number, y2: number) {
    const distance = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.round(distance / gap));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      doc.circle(px, py, size / 2).fill(turquoise_color);
    }
  }

  function drawCornerArc(cx: number, cy: number, startAngle: number, endAngle: number) {
    const arcLength = radius * Math.abs(endAngle - startAngle);
    const steps = Math.max(1, Math.round(arcLength / gap));
    const angleStep = (endAngle - startAngle) / steps;
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + i * angleStep;
      const px = cx + radius * Math.cos(angle);
      const py = cy + radius * Math.sin(angle);
      doc.circle(px, py, size / 2).fill(turquoise_color);
    }
  }

  drawPointsLine(x + radius, yRect, imageX - padding, yRect);
  drawPointsLine(imageX + desiredWidth + padding, yRect, x + width - radius, yRect);
  drawPointsLine(x, yRect + radius, x, yRect + height - radius);
  drawPointsLine(x + width, yRect + radius, x + width, yRect + height - radius);
  drawPointsLine(x + radius, yRect + height, x + width - radius, yRect + height);
  drawCornerArc(x + radius, yRect + radius, Math.PI, 1.5 * Math.PI);
  drawCornerArc(x + width - radius, yRect + radius, 1.5 * Math.PI, 2 * Math.PI);
  drawCornerArc(x + radius, yRect + height - radius, 0.5 * Math.PI, Math.PI);
  drawCornerArc(x + width - radius, yRect + height - radius, 0, 0.5 * Math.PI);
  doc.restore();

  y = frameBottom + 30;

  // 5. Forces associées
  const labelTextForces = "Forces associées";
  doc.font("semiboldAktiv").fontSize(12);
  const labelWidthForces = doc.widthOfString(labelTextForces) + 35;
  const labelHeightForces = 22;
  const labelXForces = 45;
  const labelYForces = y;

  doc.save();
  doc.roundedRect(labelXForces, labelYForces, labelWidthForces, labelHeightForces, labelHeightForces / 2)
    .fill(turquoise_color);
  doc.restore();

  doc.fillColor("white")
    .text(labelTextForces, labelXForces, labelYForces + (labelHeightForces - doc.currentLineHeight()) / 2, {
      width: labelWidthForces,
      align: "center",
    });

  doc.moveDown(1);
  y = y + 29;

  for (const force of data.associatedStrengths) {
    const [title, description] = force.split(":").map(s => s.trim());
    if (title) {
      doc.font("boldItalicAktiv").fontSize(10.5).fillColor(turquoise_color)
        .text(title, labelXForces, y, { continued: !!description });
    }
    if (description) {
      doc.font("regularAktiv").fontSize(10.5).fillColor("black")
        .text(" : " + description);
    }

    y = doc.y + 2.5;
  }

  y = y + 10;

  // 6. Zones de vigilance
  const labelTextZones = "Zone de vigilance";
  doc.font("semiboldAktiv").fontSize(12);
  const labelWidthZones = doc.widthOfString(labelTextZones) + 35;
  const labelHeightZones = 22;
  const labelXZones = 45;
  const labelYZones = y;

  doc.save();
  doc.roundedRect(labelXZones, labelYZones, labelWidthZones, labelHeightZones, labelHeightZones / 2).fill(turquoise_color);
  doc.restore();

  doc.fillColor("white")
    .text(labelTextZones, labelXZones, labelYZones + (labelHeightZones - doc.currentLineHeight()) / 2, {
      width: labelWidthZones,
      align: "center",
    });

  doc.moveDown(1);
  y = y + 30;
  for (const zone of data.vigilanceZones) {
    const [title, description] = zone.split(":").map(s => s.trim());
    if (title) {
      doc.font("boldItalicAktiv").fontSize(10.5).fillColor(turquoise_color)
        .text(title, labelXZones, y, { continued: !!description });
    }
    if (description) {
      doc.font("regularAktiv").fontSize(10.5).fillColor("black")
        .text(" : " + description);
    }
    y = doc.y + 2.5;
  }

  // 7. Mots-clés
  const originalKWWidth = 1612;
  const originalKWHeight = 251;
  const desiredKWWidth = pageWidth * 0.55;
  const desiredKWHeight = (desiredKWWidth * originalKWHeight) / originalKWWidth;

  const bottomMargin = 20;
  const kwX = (pageWidth - desiredKWWidth) / 2;
  const kwY = doc.page.height - desiredKWHeight - bottomMargin;

  doc.image(keywordsImageBuffer, kwX, kwY, {
    width: desiredKWWidth,
    height: desiredKWHeight,
  });

  doc.font("semiboldAktiv").fontSize(13).fillColor("#040c33");
  const keywordsText = data.keywords.join(" - ");
  const textWidthKW = doc.widthOfString(keywordsText);
  const textHeightKW = doc.currentLineHeight();
  const textXKey = kwX + (desiredKWWidth - textWidthKW) / 2;
  const textY = kwY + (desiredKWHeight - textHeightKW) / 2;

  doc.text(keywordsText, textXKey, textY, { lineBreak: false });
}
