import { randomUUID } from "crypto";
import { AuthSession } from "../../models/session.model";

const sessionsByJwtId = new Map<string, AuthSession>();
const sessionsByUserId = new Map<string, AuthSession[]>();

export class AuthSessionRepository {
  async create(userId: string, jwtId: string, ip: string, userAgent: string | null, expiresAt: Date): Promise<AuthSession> {
    const session: AuthSession = {
      id: randomUUID(),
      userId,
      jwtId,
      issuedAt: new Date(),
      expiresAt,
      revokedAt: null,
      revokeReason: null,
      createdIp: ip,
      createdUserAgent: userAgent
    };
    sessionsByJwtId.set(jwtId, session);
    const existing = sessionsByUserId.get(userId) ?? [];
    existing.push(session);
    sessionsByUserId.set(userId, existing);
    return session;
  }

  async findByJwtId(jwtId: string): Promise<AuthSession | null> {
    return sessionsByJwtId.get(jwtId) ?? null;
  }

  async revokeAllForUser(userId: string, reason: string): Promise<void> {
    const sessions = sessionsByUserId.get(userId) ?? [];
    const now = new Date();
    for (const session of sessions) {
      if (!session.revokedAt) {
        session.revokedAt = now;
        session.revokeReason = reason;
      }
    }
  }

  async clearAll(): Promise<void> {
    sessionsByJwtId.clear();
    sessionsByUserId.clear();
  }
}
