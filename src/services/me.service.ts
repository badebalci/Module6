import { ApiError } from "../api/errors";
import { AuthSessionRepository } from "../db/repositories/auth-session.repository";
import { UserRepository } from "../db/repositories/user.repository";
import { AuthJwtPayload } from "../security/jwt";

/** Authenticated user profile response. */
export interface MeResult {
  userId: string;
  email: string;
  tokenVersion: number;
}

/**
 * Resolves authenticated profile and enforces token/session revocation constraints.
 */
export class MeService {
  constructor(private readonly users: UserRepository, private readonly sessions: AuthSessionRepository) {}

  async getProfile(payload: AuthJwtPayload): Promise<MeResult> {
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
    }

    const sessionActive = await this.sessions.isSessionActive(payload.jti);
    if (!sessionActive) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
    }

    return {
      userId: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion
    };
  }
}
