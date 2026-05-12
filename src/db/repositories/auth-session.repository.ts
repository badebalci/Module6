import { randomUUID } from "crypto";
import { DbClient } from "../client";

/** Authentication session persistence contract. */
export interface AuthSessionRepository {
  create(userId: string, jwtId: string, expiresAt: Date, createdIp?: string, createdUserAgent?: string): Promise<void>;
  isSessionActive(jwtId: string): Promise<boolean>;
  revokeAllForUser(userId: string, reason: string): Promise<void>;
}

/** PostgreSQL implementation for auth session persistence and revocation checks. */
export class PgAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly db: DbClient) {}

  async create(userId: string, jwtId: string, expiresAt: Date, createdIp?: string, createdUserAgent?: string): Promise<void> {
    await this.db.query(
      `INSERT INTO auth_sessions (id, user_id, jwt_id, issued_at, expires_at, created_ip, created_user_agent)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6)`,
      [randomUUID(), userId, jwtId, expiresAt, createdIp ?? null, createdUserAgent ?? null]
    );
  }

  async isSessionActive(jwtId: string): Promise<boolean> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM auth_sessions
       WHERE jwt_id = $1
         AND revoked_at IS NULL
         AND expires_at >= NOW()`,
      [jwtId]
    );
    return Number(result.rows[0]?.count ?? 0) > 0;
  }

  async revokeAllForUser(userId: string, reason: string): Promise<void> {
    await this.db.query(
      `UPDATE auth_sessions
       SET revoked_at = NOW(), revoke_reason = $2
       WHERE user_id = $1
         AND revoked_at IS NULL
         AND expires_at >= NOW()`,
      [userId, reason]
    );
  }
}
