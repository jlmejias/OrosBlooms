const { rm } = require("node:fs/promises");
const { assertSafeE2eCleanupTarget, e2eUploadRoot } = require("./e2e-safety.cjs");

async function main() {
  const target = assertSafeE2eCleanupTarget(e2eUploadRoot());
  await rm(target, { recursive: true, force: true });
  process.stdout.write("Archivos E2E eliminados del directorio QA dedicado.\n");
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "No se pudieron limpiar los archivos E2E."}\n`);
  process.exitCode = 1;
});
