import bcrypt from "bcrypt";

/**
 * Hashes a clear-text password with configured bcrypt rounds.
 */
export function hashPassword(password: string, rounds: number): Promise<string> {
  return bcrypt.hash(password, rounds);
}

/**
 * Compares clear-text password against stored bcrypt hash.
 */
export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
