import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type UploadedFile = { pathname: string; url: string };
type PrivateFile = { bytes: Uint8Array; contentType: string; etag?: string; notModified?: boolean };

function required(name: string) { const value = process.env[name]; if (!value) throw new Error(`${name} es obligatorio para Cloudflare R2.`); return value; }
let r2: S3Client | undefined;
function client() { if (!r2) r2 = new S3Client({ region: "auto", endpoint: `https://${required("CLOUDFLARE_R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`, credentials: { accessKeyId: required("CLOUDFLARE_R2_ACCESS_KEY_ID"), secretAccessKey: required("CLOUDFLARE_R2_SECRET_ACCESS_KEY") } }); return r2; }
function publicUrl(pathname: string) { return `${required("CLOUDFLARE_R2_PUBLIC_URL").replace(/\/$/, "")}/${pathname}`; }

export async function uploadPublicBlob(pathname: string, file: File): Promise<UploadedFile> { await client().send(new PutObjectCommand({ Bucket: required("CLOUDFLARE_R2_PUBLIC_BUCKET"), Key: pathname, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type, CacheControl: "public, max-age=31536000, immutable" })); return { pathname, url: publicUrl(pathname) }; }
export async function uploadPrivateBlob(pathname: string, file: File): Promise<UploadedFile> { await client().send(new PutObjectCommand({ Bucket: required("CLOUDFLARE_R2_PRIVATE_BUCKET"), Key: pathname, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type, CacheControl: "private, no-store" })); return { pathname, url: `r2-private://${pathname}` }; }
export async function getPrivateBlob(pathname: string, ifNoneMatch?: string): Promise<PrivateFile | null> { try { const result = await client().send(new GetObjectCommand({ Bucket: required("CLOUDFLARE_R2_PRIVATE_BUCKET"), Key: pathname })); const etag = result.ETag; if (ifNoneMatch && etag === ifNoneMatch) return { bytes: new Uint8Array(), contentType: result.ContentType ?? "application/octet-stream", etag, notModified: true }; const bytes = result.Body ? await result.Body.transformToByteArray() : new Uint8Array(); return { bytes, contentType: result.ContentType ?? "application/octet-stream", etag }; } catch (error) { const code = (error as { name?: string }).name; if (code === "NoSuchKey" || code === "NotFound") return null; throw error; } }
