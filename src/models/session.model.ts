/** Active authentication session metadata. */
export interface AuthSession {
  id: string;
  userId: string;
  jwtId: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

/** Backoff state tracked by account identifier + source IP. */
export interface LoginAttemptBackoff {
  emailKey: string;
  ipAddress: string;
  failureCount: number;
  nextAllowedAt: Date;
}
