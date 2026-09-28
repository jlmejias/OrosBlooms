import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import safety from "../scripts/e2e-safety.cjs";
import { shouldUseLocalStorage } from "../lib/blob.ts";

const { assertSafeE2eCleanupTarget, assertSafeE2eDatabaseUrl, buildE2eEnvironment, e2eUploadRoot } = safety;

test("clear-db rechaza desarrollo local y acepta solamente nombres QA/test", () => {
  assert.throws(() => assertSafeE2eDatabaseUrl("postgresql://user:pass@localhost:5432/orosblooms_dev"), /_qa o _test/);
  assert.equal(assertSafeE2eDatabaseUrl("postgresql://user:pass@localhost:5432/orosblooms_dev_qa").database, "orosblooms_dev_qa");
  assert.throws(() => assertSafeE2eDatabaseUrl("postgresql://user:pass@db.example.com:5432/orosblooms_qa"), /local/);
});

test("QA fuerza storage local y elimina credenciales remotas del proceso E2E", () => {
  const environment = buildE2eEnvironment({
    NODE_ENV: "production",
    NEON_OBJECT_STORAGE_ENDPOINT: "https://storage.example.test",
    NEON_OBJECT_STORAGE_ACCESS_KEY_ID: "remote-key",
    NEON_OBJECT_STORAGE_SECRET_ACCESS_KEY: "remote-secret",
    NEON_OBJECT_STORAGE_PUBLIC_BUCKET: "public",
    NEON_OBJECT_STORAGE_PRIVATE_BUCKET: "private",
  });
  assert.equal(environment.LOCAL_STORAGE_FOR_QA, "true");
  assert.equal(environment.EMAIL_TRANSPORT, "mock");
  assert.equal(environment.NEON_OBJECT_STORAGE_ENDPOINT, undefined);
  assert.equal(environment.NEON_OBJECT_STORAGE_SECRET_ACCESS_KEY, undefined);
  assert.equal(shouldUseLocalStorage(environment), true);
});

test("cleanup acepta únicamente el directorio E2E dedicado", () => {
  const workspace = path.resolve("C:/workspace/orosblooms");
  const target = e2eUploadRoot(workspace);
  assert.equal(assertSafeE2eCleanupTarget(target, workspace), target);
  assert.throws(() => assertSafeE2eCleanupTarget(path.join(workspace, "public", "uploads"), workspace), /directorio E2E dedicado/);
  assert.throws(() => assertSafeE2eCleanupTarget(workspace, workspace), /directorio E2E dedicado/);
});
