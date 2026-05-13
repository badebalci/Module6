import dotenv from "dotenv";

dotenv.config();

/** App/runtime environment configuration with safe defaults for local development. */
export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "24h",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  passwordResetTokenTtlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? 15)
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET must be configured");
}
