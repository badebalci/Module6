import { createHash, randomUUID } from "crypto";
import { DbClient } from "../client";
import { LoginAttemptBackoff } from "../../models/session.model";
import { PasswordResetToken } from "../../models/password-reset-token.model";

/** Password reset token persistence contract. */
export interface PasswordResetRepository {
  createToken(userId: string, plainToken: string, expiresAt: Date, requestIp?: string): Promise<void>;
  findValidToken(plainToken: string): Promise<PasswordResetToken | null>;
  markUsed(tokenId: string): Promise<void>;
  invalidateSiblingTokens(userId: string, exceptId: string): Promise<void>;
}

/** Login backoff persistence contract. */
export interface LoginBackoffRepository {
  find(emailKey: string, ipAddress: string): Promise<LoginAttemptBackoff | null>;
  recordFailure(emailKey: string, ipAddress: string, failureCount: number, nextAllowedAt: Date): Promise<void>;
  clear(emailKey: string, ipAddress: string): Promise<void>;
}

/** PostgreSQL implementation for reset tokens and login backoff records. */
export class PgPasswordResetRepository implements PasswordResetRepository, LoginBackoffRepository {
  constructor(private readonly db: DbClient) {}

  async createToken(userId: string, plainToken: string, expiresAt: Date, requestIp?: string): Promise<void> {
    const tokenHash = sha256(plainToken);
    await this.db.query(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at, request_ip)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [randomUUID(), userId, tokenHash, expiresAt, requestIp ?? null]
    );
  }

  async findValidToken(plainToken: string): Promise<PasswordResetToken | null> {
    const tokenHash = sha256(plainToken);
    const result = await this.db.query<any>(
      `SELECT id, user_id, token_hash, expires_at, used_at, invalidated_at, created_at
       FROM password_reset_tokens
       WHERE token_hash = $1
       LIMIT 1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const token = {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      usedAt: row.used_at ? new Date(row.used_at) : null,
      invalidatedAt: row.invalidated_at ? new Date(row.invalidated_at) : null,
      createdAt: new Date(row.created_at)
    } as PasswordResetToken;

    const now = Date.now();
    if (token.usedAt || token.invalidatedAt || token.expiresAt.getTime() < now) {
      return null;
    }

    return token;
  }

  async markUsed(tokenId: string): Promise<void> {
    await this.db.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [tokenId]);
  }

  async invalidateSiblingTokens(userId: string, exceptId: string): Promise<void> {
    await this.db.query(
      `UPDATE password_reset_tokens
       SET invalidated_at = NOW()
       WHERE user_id = $1
         AND id <> $2
         AND used_at IS NULL
         AND invalidated_at IS NULL
         AND expires_at >= NOW()`,
      [userId, exceptId]
    );
  }

  async find(emailKey: string, ipAddress: string): Promise<LoginAttemptBackoff | null> {
    const result = await this.db.query<any>(
      `SELECT email_key, ip_address, failure_count, next_allowed_at
       FROM login_attempt_backoff
       WHERE email_key = $1 AND ip_address = $2`,
      [emailKey, ipAddress]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return {
      emailKey: result.rows[0].email_key,
      ipAddress: result.rows[0].ip_address,
      failureCount: Number(result.rows[0].failure_count),
      nextAllowedAt: new Date(result.rows[0].next_allowed_at)
    };
  }

  async recordFailure(emailKey: string, ipAddress: string, failureCount: number, nextAllowedAt: Date): Promise<void> {
    await this.db.query(
      `INSERT INTO login_attempt_backoff (id, email_key, ip_address, failure_count, next_allowed_at, last_failed_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
       ON CONFLICT (email_key, ip_address)
       DO UPDATE SET failure_count = EXCLUDED.failure_count,
                     next_allowed_at = EXCLUDED.next_allowed_at,
                     last_failed_at = NOW(),
                     updated_at = NOW()`,
      [randomUUID(), emailKey, ipAddress, failureCount, nextAllowedAt]
    );
  }

  async clear(emailKey: string, ipAddress: string): Promise<void> {
    await this.db.query(`DELETE FROM login_attempt_backoff WHERE email_key = $1 AND ip_address = $2`, [
      emailKey,
      ipAddress
    ]);
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
