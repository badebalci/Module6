import { PasswordResetToken } from "../models/password-reset-token.model";

/**
 * Determines whether a reset token is currently usable.
 */
export function isPasswordResetTokenActive(token: PasswordResetToken, now: Date = new Date()): boolean {
  if (token.usedAt || token.invalidatedAt) {
    return false;
  }
  return token.expiresAt.getTime() >= now.getTime();
}
