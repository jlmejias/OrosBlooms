const signatures = {
  "image/jpeg": (bytes: Uint8Array) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": (bytes: Uint8Array) => bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value),
  "image/webp": (bytes: Uint8Array) => bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
} satisfies Record<string, (bytes: Uint8Array) => boolean>;

const additionalSignatures = {
  "image/x-icon": (bytes: Uint8Array) => bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00,
  "image/vnd.microsoft.icon": (bytes: Uint8Array) => bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00,
  "video/mp4": (bytes: Uint8Array) => bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp",
  "video/webm": (bytes: Uint8Array) => bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3,
} satisfies Record<string, (bytes: Uint8Array) => boolean>;

export type SafeImageMime = keyof typeof signatures;

export function hasValidImageSignature(bytes: Uint8Array, mime: string): mime is SafeImageMime {
  return mime in signatures && signatures[mime as SafeImageMime](bytes);
}

export function hasValidUploadSignature(bytes: Uint8Array, mime: string) {
  if (hasValidImageSignature(bytes, mime)) return true;
  return mime in additionalSignatures && additionalSignatures[mime as keyof typeof additionalSignatures](bytes);
}

export function isValidUploadedFile(bytes: Uint8Array, mime: string, size: number, allowedMimes: readonly string[], maxBytes: number) {
  return size > 0 && size <= maxBytes && allowedMimes.includes(mime) && hasValidUploadSignature(bytes, mime);
}
