import { scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
const KEY_LENGTH = 64;

function derive(password: string, salt: string, cost: number, blockSize: number, parallelization: number) {
  return new Promise<Buffer>((resolve, reject) => nodeScrypt(password, salt, KEY_LENGTH, { N: cost, r: blockSize, p: parallelization, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)));
}

export async function hashPassword(password: string, salt: string, cost = 16384, blockSize = 8, parallelization = 1) {
  const derived = await derive(password, salt, cost, blockSize, parallelization);
  return `scrypt$${cost}$${blockSize}$${parallelization}$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, costText, blockSizeText, parallelizationText, salt, expectedText] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedText) return false;
  const cost = Number(costText); const blockSize = Number(blockSizeText); const parallelization = Number(parallelizationText);
  if (![cost, blockSize, parallelization].every(Number.isSafeInteger) || cost < 16384 || blockSize < 8 || parallelization < 1) return false;
  try {
    const actual = await derive(password, salt, cost, blockSize, parallelization);
    const expected = Buffer.from(expectedText, "base64url");
    return expected.length === actual.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}
