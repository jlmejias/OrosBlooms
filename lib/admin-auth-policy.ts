export function acceptsDevelopmentAdminCredentials(environment: NodeJS.ProcessEnv = process.env) {
  return environment.NODE_ENV === "development";
}

export function adminSessionSecret(environment: NodeJS.ProcessEnv = process.env) {
  const value = environment.ADMIN_SESSION_SECRET?.trim();
  if (value && value.length >= 32) return value;
  if (environment.NODE_ENV === "development" && environment.ALLOW_INSECURE_LOCAL_ADMIN === "true") {
    return "orosblooms-explicit-local-development-secret-change-me";
  }
  throw new Error("ADMIN_SESSION_SECRET debe tener al menos 32 caracteres");
}
