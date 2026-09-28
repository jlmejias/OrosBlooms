export function assertSafeE2eDatabaseUrl(databaseUrl: string): { url: URL; database: string };
export function e2eUploadRoot(workspaceRoot?: string): string;
export function assertSafeE2eCleanupTarget(target: string, workspaceRoot?: string): string;
export const remoteStorageVariables: readonly string[];
export function withoutRemoteStorage(environment?: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export function buildE2eEnvironment(environment?: NodeJS.ProcessEnv): NodeJS.ProcessEnv & {
  NODE_ENV: "test";
  LOCAL_STORAGE_FOR_QA: "true";
  EMAIL_TRANSPORT: "mock";
};
