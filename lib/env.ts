import { z } from "zod";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const serverSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://").or(z.url().startsWith("postgres://")),
});

export function getServerEnv() {
  return serverSchema.parse({ DATABASE_URL: process.env.DATABASE_URL });
}

export const serverEnv = {
  get DATABASE_URL() {
    return getServerEnv().DATABASE_URL;
  },
};
