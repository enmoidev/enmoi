// Point d'entrée du stockage objet — choisit l'adaptateur selon l'environnement

import path from "path";
import { createS3Storage } from "./s3Storage";
import { createLocalStorage } from "./localStorage";
import type { ObjectStorage } from "./types";

export { ObjectNotFoundError } from "./types";
export type { ObjectStorage } from "./types";

/// Répertoire de l'adaptateur local (gitignoré).
const LOCAL_STORAGE_ROOT = path.join(process.cwd(), ".storage");

let cached: ObjectStorage | null = null;

/// Retourne l'adaptateur S3 si les variables sont renseignées, sinon l'adaptateur
/// local. En production, l'absence de configuration S3 est une erreur : le
/// filesystem y est en lecture seule, l'adaptateur local ne fonctionnerait pas.
export function getStorage(): ObjectStorage {
  if (cached) return cached;

  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  const isConfigured = Boolean(region && bucket && accessKeyId && secretAccessKey);

  if (!isConfigured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Stockage non configuré : renseignez S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID " +
          "et S3_SECRET_ACCESS_KEY. L'adaptateur local ne peut pas servir en production."
      );
    }
    console.warn(
      "[storage] Variables S3 absentes — utilisation du disque local (.storage/)."
    );
    cached = createLocalStorage(LOCAL_STORAGE_ROOT);
    return cached;
  }

  cached = createS3Storage({
    region: region!,
    bucket: bucket!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    endpoint: process.env.S3_ENDPOINT || undefined,
  });
  return cached;
}
