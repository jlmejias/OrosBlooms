const signatures = {
  "image/jpeg": (bytes: Uint8Array) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": (bytes: Uint8Array) => bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value),
  "image/webp": (bytes: Uint8Array) => bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
} satisfies Record<string, (bytes: Uint8Array) => boolean>;

export type SafeImageMime = keyof typeof signatures;

export function hasValidImageSignature(bytes: Uint8Array, mime: string): mime is SafeImageMime {
  return mime in signatures && signatures[mime as SafeImageMime](bytes);
}
