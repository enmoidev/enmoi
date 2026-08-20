// Clés de stockage et validation des visuels de forces

import { z } from "zod";

/// Les deux pages livrées par force.
export const FORCE_PAGES = ["a", "b"] as const;
export type ForcePage = (typeof FORCE_PAGES)[number];

export const TOTAL_FORCES = 100;

/// Les forces sont numérotées **de 0 à 99**, numérotation retenue par le client.
/// Ces deux bornes sont la source unique : tout ce qui valide, seede ou affiche
/// un numéro de force s'y réfère, jamais à des littéraux.
export const FIRST_FORCE_NUMBER = 0;
export const LAST_FORCE_NUMBER = FIRST_FORCE_NUMBER + TOTAL_FORCES - 1;

/// « 0 et 99 » — pour les messages destinés à l'administrateur.
export const FORCE_NUMBER_RANGE = `${FIRST_FORCE_NUMBER} et ${LAST_FORCE_NUMBER}`;

/// Dimensions attendues : A4 à 300 DPI, format des gabarits fournis par le client.
export const EXPECTED_WIDTH_PX = 2480;
export const EXPECTED_HEIGHT_PX = 3508;

/// Marge de sécurité : les visuels observés pèsent ~350 Ko.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const forceNumberSchema = z.coerce
  .number()
  .int("Le numéro de force doit être un entier.")
  .min(FIRST_FORCE_NUMBER, `Le numéro de force doit être compris entre ${FORCE_NUMBER_RANGE}.`)
  .max(LAST_FORCE_NUMBER, `Le numéro de force doit être compris entre ${FORCE_NUMBER_RANGE}.`);

export const forcePageSchema = z.enum(FORCE_PAGES);

/// Construit la clé de stockage d'un visuel.
///
/// La clé dépend de l'identifiant interne de la force, jamais de son numéro ni
/// du nom du fichier déposé. Le numéro est une donnée métier que l'administrateur
/// peut réattribuer depuis la médiathèque : s'il entrait dans la clé, chaque
/// renumérotation obligerait à déplacer des objets dans le stockage, une
/// opération qui ne peut pas être atomique avec l'écriture en base.
///
/// L'`id` étant un cuid immuable, renuméroter redevient un simple UPDATE.
export function forceAssetKey(forceId: string, page: ForcePage): string {
  return `forces/${forceId}/${page}.png`;
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
