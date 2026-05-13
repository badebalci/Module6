import bcrypt from "bcrypt";
import { env } from "../config/env";

/** Hashes a plaintext password with configured bcrypt work factor. */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, env.bcryptRounds);
};

/** Compares plaintext password against bcrypt hash. */
export const comparePassword = async (plainPassword: string, passwordHash: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, passwordHash);
};
