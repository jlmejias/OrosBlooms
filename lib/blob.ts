import { get, put } from "@vercel/blob";

function privateToken() {
  const token = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("PRIVATE_BLOB_READ_WRITE_TOKEN es obligatorio para archivos privados.");
  return token;
}

export function uploadPublicBlob(pathname: string, file: File) {
  return put(pathname, file, { access: "public", addRandomSuffix: true });
}

export function uploadPrivateBlob(pathname: string, file: File) {
  return put(pathname, file, { access: "private", addRandomSuffix: true, token: privateToken() });
}

export function getPrivateBlob(pathname: string, ifNoneMatch?: string) {
  return get(pathname, { access: "private", token: privateToken(), ifNoneMatch });
}
