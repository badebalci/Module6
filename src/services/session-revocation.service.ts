import { AuthSessionRepository } from "../db/repositories/auth-session.repository";
import { UserRepository } from "../db/repositories/user.repository";
import { ApiError } from "./errors";

export class SessionRevocationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository
  ) {}

  async revokeAllForUser(userId: string): Promise<number> {
    const updated = await this.userRepository.incrementTokenVersion(userId);
    if (!updated) {
      throw new ApiError(400, "Invalid reset token");
    }

    await this.authSessionRepository.revokeAllForUser(userId, "password-reset");
    return updated.tokenVersion;
  }
}
