import { randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";

const password = process.argv[2];
if (!password || password.length < 12) throw new Error("Proporciona una contraseña de al menos 12 caracteres.");
const salt = randomBytes(16).toString("base64url");
const derived = await promisify(nodeScrypt)(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
process.stdout.write(`scrypt$16384$8$1$${salt}$${Buffer.from(derived).toString("base64url")}\n`);
