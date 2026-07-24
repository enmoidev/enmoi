// Adaptateur disque local — développement et tests uniquement
//
// Permet de travailler sans identifiants AWS. Inutilisable en production :
// le filesystem de Vercel est en lecture seule.

import fs from "fs/promises";
import path from "path";
import { ObjectNotFoundError, type ObjectStorage } from "./types";

/// Refuse toute clé qui tenterait de sortir du répertoire racine.
function resolveSafePath(root: string, key: string): string {
  const target = path.resolve(root, key);
  const normalizedRoot = path.resolve(root);
  if (target !== normalizedRoot && !target.startsWith(normalizedRoot + path.sep)) {
    throw new Error(`Clé de stockage invalide : ${key}`);
  }
  return target;
}

export function createLocalStorage(root: string): ObjectStorage {
  return {
    async put(key, body) {
      const target = resolveSafePath(root, key);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, body);
    },

    async getBuffer(key) {
      const target = resolveSafePath(root, key);
      try {
        return await fs.readFile(target);
      } catch {
        throw new ObjectNotFoundError(key);
      }
    },

    async remove(key) {
      const target = resolveSafePath(root, key);
      await fs.rm(target, { force: true });
    },

    async exists(key) {
      const target = resolveSafePath(root, key);
      try {
        await fs.access(target);
        return true;
      } catch {
        return false;
      }
    },

    async signedUrl(key) {
      // Pas de signature en local : la route de prévisualisation sert le fichier
      // elle-même après contrôle de session.
      return `/api/forces/preview?key=${encodeURIComponent(key)}`;
    },
  };
}
