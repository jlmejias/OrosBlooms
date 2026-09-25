import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

type UploadedFile = { pathname: string; url: string };
type PrivateFile = { bytes: Uint8Array; contentType: string; etag?: string; notModified?: boolean };

const storageVariables = ["NEON_OBJECT_STORAGE_ENDPOINT", "NEON_OBJECT_STORAGE_ACCESS_KEY_ID", "NEON_OBJECT_STORAGE_SECRET_ACCESS_KEY", "NEON_OBJECT_STORAGE_PUBLIC_BUCKET", "NEON_OBJECT_STORAGE_PRIVATE_BUCKET"] as const;
const hasRemoteStorage = () => storageVariables.every(name => Boolean(process.env[name]));
const shouldUseLocalStorage = () => (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || process.env.LOCAL_STORAGE_FOR_QA === "true") && !hasRemoteStorage();
function required(name: typeof storageVariables[number]) { const value = process.env[name]; if (!value) throw new Error(`${name} es obligatorio para Neon Object Storage.`); return value; }
function safePathname(pathname: string) { if (!pathname || pathname.includes("..") || path.isAbsolute(pathname)) throw new Error("Ruta de archivo inválida."); return pathname.replaceAll("\\", "/"); }

let storage: S3Client | undefined;
function client() {
  if (!storage) storage = new S3Client({ region: "us-east-1", endpoint: required("NEON_OBJECT_STORAGE_ENDPOINT"), forcePathStyle: true, credentials: { accessKeyId: required("NEON_OBJECT_STORAGE_ACCESS_KEY_ID"), secretAccessKey: required("NEON_OBJECT_STORAGE_SECRET_ACCESS_KEY") } });
  return storage;
}
function publicUrl(pathname: string) { return `${required("NEON_OBJECT_STORAGE_ENDPOINT").replace(/\/$/, "")}/${required("NEON_OBJECT_STORAGE_PUBLIC_BUCKET")}/${pathname}`; }
function localPublicPath(pathname: string) { return path.join(process.cwd(), "public", "uploads", safePathname(pathname)); }
function localPrivatePath(pathname: string) { return path.join(process.cwd(), "storage", "object-storage", safePathname(pathname)); }
function contentType(pathname: string) { const extension=path.extname(pathname).toLowerCase();return ({".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".ico":"image/x-icon",".mp4":"video/mp4",".webm":"video/webm",".pdf":"application/pdf"} as Record<string,string>)[extension]??"application/octet-stream"; }

export async function uploadPublicBlob(pathname: string, file: File): Promise<UploadedFile> {
  pathname=safePathname(pathname);
  if (shouldUseLocalStorage()) {
    const destination=localPublicPath(pathname);
    await mkdir(path.dirname(destination),{recursive:true});
    await writeFile(destination,Buffer.from(await file.arrayBuffer()));
    return {pathname,url:`/uploads/${pathname}`};
  }
  await client().send(new PutObjectCommand({Bucket:required("NEON_OBJECT_STORAGE_PUBLIC_BUCKET"),Key:pathname,Body:Buffer.from(await file.arrayBuffer()),ContentType:file.type,CacheControl:"public, max-age=31536000, immutable"}));
  return {pathname,url:publicUrl(pathname)};
}

export async function uploadPrivateBlob(pathname: string, file: File): Promise<UploadedFile> {
  pathname=safePathname(pathname);
  if (shouldUseLocalStorage()) {
    const destination=localPrivatePath(pathname);
    await mkdir(path.dirname(destination),{recursive:true});
    await writeFile(destination,Buffer.from(await file.arrayBuffer()));
    return {pathname,url:`local-private://${pathname}`};
  }
  await client().send(new PutObjectCommand({Bucket:required("NEON_OBJECT_STORAGE_PRIVATE_BUCKET"),Key:pathname,Body:Buffer.from(await file.arrayBuffer()),ContentType:file.type,CacheControl:"private, no-store"}));
  return {pathname,url:`neon-private://${pathname}`};
}

export async function getPrivateBlob(pathname: string, ifNoneMatch?: string): Promise<PrivateFile | null> {
  pathname=safePathname(pathname);
  if (shouldUseLocalStorage()) {
    try {
      const destination=localPrivatePath(pathname);const info=await stat(destination);const etag=`"${info.size}-${Math.trunc(info.mtimeMs)}"`;
      if(ifNoneMatch===etag)return {bytes:new Uint8Array(),contentType:contentType(pathname),etag,notModified:true};
      return {bytes:new Uint8Array(await readFile(destination)),contentType:contentType(pathname),etag};
    } catch(error) { if((error as NodeJS.ErrnoException).code==="ENOENT")return null;throw error; }
  }
  try { const result=await client().send(new GetObjectCommand({Bucket:required("NEON_OBJECT_STORAGE_PRIVATE_BUCKET"),Key:pathname}));const etag=result.ETag;if(ifNoneMatch&&etag===ifNoneMatch)return {bytes:new Uint8Array(),contentType:result.ContentType??"application/octet-stream",etag,notModified:true};const bytes=result.Body?await result.Body.transformToByteArray():new Uint8Array();return {bytes,contentType:result.ContentType??"application/octet-stream",etag}; }
  catch(error){const code=(error as {name?:string}).name;if(code==="NoSuchKey"||code==="NotFound")return null;throw error;}
}

export async function deletePrivateBlob(pathname: string) {
  pathname = safePathname(pathname);
  if (shouldUseLocalStorage()) {
    try { await unlink(localPrivatePath(pathname)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    return;
  }
  await client().send(new DeleteObjectCommand({ Bucket: required("NEON_OBJECT_STORAGE_PRIVATE_BUCKET"), Key: pathname }));
}

export async function deletePublicBlob(pathname: string) {
  pathname = safePathname(pathname);
  if (shouldUseLocalStorage()) {
    try { await unlink(localPublicPath(pathname)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    return;
  }
  await client().send(new DeleteObjectCommand({ Bucket: required("NEON_OBJECT_STORAGE_PUBLIC_BUCKET"), Key: pathname }));
}
