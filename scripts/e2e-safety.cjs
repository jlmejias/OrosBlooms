const path = require("node:path");

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const remoteStorageVariables = [
  "NEON_OBJECT_STORAGE_ENDPOINT",
  "NEON_OBJECT_STORAGE_ACCESS_KEY_ID",
  "NEON_OBJECT_STORAGE_SECRET_ACCESS_KEY",
  "NEON_OBJECT_STORAGE_PUBLIC_BUCKET",
  "NEON_OBJECT_STORAGE_PRIVATE_BUCKET",
];

function assertSafeE2eDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  if (!localHosts.has(url.hostname)) throw new Error("La limpieza solo permite PostgreSQL local.");
  const database = decodeURIComponent(url.pathname.slice(1));
  if (!/(_qa|_test)$/i.test(database)) throw new Error("La limpieza solo permite bases cuyo nombre termine en _qa o _test.");
  return { url, database };
}

function e2eUploadRoot(workspaceRoot = process.cwd()) {
  return path.resolve(workspaceRoot, ".data", "e2e-uploads");
}

function assertSafeE2eCleanupTarget(target, workspaceRoot = process.cwd()) {
  const expected = e2eUploadRoot(workspaceRoot);
  const resolved = path.resolve(target);
  if (resolved !== expected) throw new Error("La limpieza solo puede eliminar el directorio E2E dedicado.");
  return resolved;
}

function withoutRemoteStorage(environment = process.env) {
  return Object.fromEntries(Object.entries(environment).filter(([name]) => !remoteStorageVariables.includes(name)));
}

function buildE2eEnvironment(environment = process.env) {
  return {
    ...withoutRemoteStorage(environment),
    NODE_ENV: "test",
    LOCAL_STORAGE_FOR_QA: "true",
    EMAIL_TRANSPORT: "mock",
  };
}

module.exports = {
  assertSafeE2eDatabaseUrl,
  assertSafeE2eCleanupTarget,
  buildE2eEnvironment,
  e2eUploadRoot,
  remoteStorageVariables,
  withoutRemoteStorage,
};
