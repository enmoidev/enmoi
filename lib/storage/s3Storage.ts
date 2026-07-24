// Adaptateur AWS S3 (compatible avec tout service exposant l'API S3)

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ObjectNotFoundError, type ObjectStorage } from "./types";

const DEFAULT_SIGNED_URL_TTL_SECONDS = 300;

type S3StorageConfig = {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /// Renseigné uniquement pour un service S3-compatible (R2, MinIO...).
  endpoint?: string;
};

/// Vrai si l'erreur du SDK signale une clé absente.
function isNotFound(err: unknown): boolean {
  const name = (err as { name?: string })?.name;
  const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
  return name === "NoSuchKey" || name === "NotFound" || status === 404;
}

export function createS3Storage(config: S3StorageConfig): ObjectStorage {
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    ...(config.endpoint
      ? { endpoint: config.endpoint, forcePathStyle: true }
      : {}),
  });

  return {
    async put(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );
    },

    async getBuffer(key) {
      try {
        const result = await client.send(
          new GetObjectCommand({ Bucket: config.bucket, Key: key })
        );
        if (!result.Body) throw new ObjectNotFoundError(key);
        const bytes = await result.Body.transformToByteArray();
        return Buffer.from(bytes);
      } catch (err) {
        if (isNotFound(err)) throw new ObjectNotFoundError(key);
        throw err;
      }
    },

    async remove(key) {
      // S3 renvoie un succès même si la clé n'existait pas : rien à rattraper.
      await client.send(
        new DeleteObjectCommand({ Bucket: config.bucket, Key: key })
      );
    },

    async exists(key) {
      try {
        await client.send(
          new HeadObjectCommand({ Bucket: config.bucket, Key: key })
        );
        return true;
      } catch (err) {
        if (isNotFound(err)) return false;
        throw err;
      }
    },

    async signedUrl(key, expiresInSeconds = DEFAULT_SIGNED_URL_TTL_SECONDS) {
      return getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: config.bucket, Key: key }),
        { expiresIn: expiresInSeconds }
      );
    },
  };
}
