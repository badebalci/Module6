import { randomUUID } from "crypto";
import { DbClient } from "../client";
import { User } from "../../models/user.model";

/** User data access contract. */
export interface UserRepository {
  create(email: string, passwordHash: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePasswordAndIncrementTokenVersion(userId: string, passwordHash: string): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
}

/** PostgreSQL implementation of user data operations. */
export class PgUserRepository implements UserRepository {
  constructor(private readonly db: DbClient) {}

  async create(email: string, passwordHash: string): Promise<User> {
    const now = new Date();
    const id = randomUUID();
    const result = await this.db.query<User & { password_hash: string; token_version: number; created_at: Date; updated_at: Date; last_login_at: Date | null }>(
      `INSERT INTO users (id, email, password_hash, token_version, created_at, updated_at)
       VALUES ($1, $2, $3, 0, $4, $4)
       RETURNING id, email, password_hash, token_version, created_at, updated_at, last_login_at`,
      [id, email.toLowerCase(), passwordHash, now]
    );
    return mapUserRow(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query<any>(
      `SELECT id, email, password_hash, token_version, created_at, updated_at, last_login_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query<any>(
      `SELECT id, email, password_hash, token_version, created_at, updated_at, last_login_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  async updatePasswordAndIncrementTokenVersion(userId: string, passwordHash: string): Promise<void> {
    await this.db.query(
      `UPDATE users
       SET password_hash = $2,
           token_version = token_version + 1,
           updated_at = NOW()
       WHERE id = $1`,
      [userId, passwordHash]
    );
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.db.query(`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`, [userId]);
  }
}

function mapUserRow(row: any): User {
  return {
    id: row.id,
    email: String(row.email),
    passwordHash: row.password_hash,
    tokenVersion: Number(row.token_version),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null
  };
}
