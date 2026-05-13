export interface AuthSession {
  id: string;
  userId: string;
  jwtId: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  revokeReason: string | null;
  createdIp: string;
  createdUserAgent: string | null;
}

export interface LoginAttemptBackoff {
  id: string;
  emailKey: string;
  ipAddress: string;
  failureCount: number;
  nextAllowedAt: Date;
  lastFailedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
