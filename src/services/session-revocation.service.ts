import { AuthSessionRepository } from "../db/repositories/auth-session.repository";
import { UserRepository } from "../db/repositories/user.repository";

/**
 * Performs global user session revocation by incrementing tokenVersion and revoking active sessions.
 */
export class SessionRevocationService {
  constructor(private readonly users: UserRepository, private readonly sessions: AuthSessionRepository) {}

  async revokeAllForUser(userId: string, newPasswordHash: string): Promise<void> {
    await this.users.updatePasswordAndIncrementTokenVersion(userId, newPasswordHash);
    await this.sessions.revokeAllForUser(userId, "password_reset");
  }
}
