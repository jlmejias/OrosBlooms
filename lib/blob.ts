import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type UploadedFile = { pathname: string; url: string };
type PrivateFile = { bytes: Uint8Array; contentType: string; etag?: string; notModified?: boolean };

function required(name: string) { const value = process.env[name]; if (!value) throw new Error(`${name} es obligatorio para Neon Object Storage.`); return value; }
let storage: S3Client | undefined;
function client() {
  if (!storage) {
    storage = new S3Client({
      region: "us-east-1",
      endpoint: required("NEON_OBJECT_STORAGE_ENDPOINT"),
      forcePathStyle: true,
      credentials: {
        accessKeyId: required("NEON_OBJECT_STORAGE_ACCESS_KEY_ID"),
        secretAccessKey: required("NEON_OBJECT_STORAGE_SECRET_ACCESS_KEY"),
      },
    });
  }
  return storage;
}
function publicUrl(pathname: string) {
  const endpoint = required("NEON_OBJECT_STORAGE_ENDPOINT").replace(/\/$/, "");
  return `${endpoint}/${required("NEON_OBJECT_STORAGE_PUBLIC_BUCKET")}/${pathname}`;
}

export async function uploadPublicBlob(pathname: string, file: File): Promise<UploadedFile> { await client().send(new PutObjectCommand({ Bucket: required("NEON_OBJECT_STORAGE_PUBLIC_BUCKET"), Key: pathname, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type, CacheControl: "public, max-age=31536000, immutable" })); return { pathname, url: publicUrl(pathname) }; }
export async function uploadPrivateBlob(pathname: string, file: File): Promise<UploadedFile> { await client().send(new PutObjectCommand({ Bucket: required("NEON_OBJECT_STORAGE_PRIVATE_BUCKET"), Key: pathname, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type, CacheControl: "private, no-store" })); return { pathname, url: `neon-private://${pathname}` }; }
export async function getPrivateBlob(pathname: string, ifNoneMatch?: string): Promise<PrivateFile | null> { try { const result = await client().send(new GetObjectCommand({ Bucket: required("NEON_OBJECT_STORAGE_PRIVATE_BUCKET"), Key: pathname })); const etag = result.ETag; if (ifNoneMatch && etag === ifNoneMatch) return { bytes: new Uint8Array(), contentType: result.ContentType ?? "application/octet-stream", etag, notModified: true }; const bytes = result.Body ? await result.Body.transformToByteArray() : new Uint8Array(); return { bytes, contentType: result.ContentType ?? "application/octet-stream", etag }; } catch (error) { const code = (error as { name?: string }).name; if (code === "NoSuchKey" || code === "NotFound") return null; throw error; } }
