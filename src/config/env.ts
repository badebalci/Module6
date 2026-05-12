import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("24h"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15)
});

/** Validated runtime environment for the authentication service. */
export type Env = z.infer<typeof envSchema>;

/**
 * Loads and validates environment variables for the service.
 * @returns Parsed environment configuration.
 */
export function loadEnv(): Env {
  return envSchema.parse(process.env);
}
