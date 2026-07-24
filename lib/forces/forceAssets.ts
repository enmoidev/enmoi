// Clés de stockage et validation des visuels de forces

import { z } from "zod";

/// Les deux pages livrées par force.
export const FORCE_PAGES = ["a", "b"] as const;
export type ForcePage = (typeof FORCE_PAGES)[number];

export const TOTAL_FORCES = 100;

/// Dimensions attendues : A4 à 300 DPI, format des gabarits fournis par le client.
export const EXPECTED_WIDTH_PX = 2480;
export const EXPECTED_HEIGHT_PX = 3508;

/// Marge de sécurité : les visuels observés pèsent ~350 Ko.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const forceNumberSchema = z.coerce
  .number()
  .int("Le numéro de force doit être un entier.")
  .min(1, "Le numéro de force doit être compris entre 1 et 100.")
  .max(TOTAL_FORCES, "Le numéro de force doit être compris entre 1 et 100.");

export const forcePageSchema = z.enum(FORCE_PAGES);

/// Construit la clé de stockage d'un visuel.
///
/// La clé dépend uniquement du numéro de force et de la page — jamais du nom du
/// fichier déposé. Le nommage d'origine du client est irrégulier (accents,
/// espaces, casse, coquilles) et ne constitue pas un identifiant fiable.
export function forceAssetKey(forceNumber: number, page: ForcePage): string {
  return `forces/${forceNumber}/${page}.png`;
}

export type ImageValidationResult =
  | { ok: true; width: number; height: number }
  | { ok: false; reason: string };

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/// Valide un visuel à partir de son contenu réel, sans faire confiance à
/// l'extension ni au Content-Type déclarés par le navigateur.
///
/// Le bloc IHDR d'un PNG est toujours le premier chunk : la signature occupe les
/// 8 premiers octets, puis la largeur et la hauteur en entiers 32 bits big-endian
/// aux offsets 16 et 20.
export function validateForceImage(buffer: Buffer): ImageValidationResult {
  if (buffer.length > MAX_UPLOAD_BYTES) {
    const mb = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0);
    return { ok: false, reason: `Le fichier dépasse la taille maximale de ${mb} Mo.` };
  }

  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { ok: false, reason: "Le fichier n'est pas une image PNG valide." };
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  if (width !== EXPECTED_WIDTH_PX || height !== EXPECTED_HEIGHT_PX) {
    return {
      ok: false,
      reason:
        `Dimensions attendues : ${EXPECTED_WIDTH_PX} × ${EXPECTED_HEIGHT_PX} px ` +
        `(A4 à 300 DPI). Fichier reçu : ${width} × ${height} px.`,
    };
  }

  return { ok: true, width, height };
}
