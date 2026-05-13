import { Pool } from "pg";
import { env } from "../config/env";

let pool: Pool | null = null;

/** Returns a shared pg pool when DATABASE_URL is configured. */
export const getPool = (): Pool | null => {
  if (!env.databaseUrl) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString: env.databaseUrl });
  }

  return pool;
};
