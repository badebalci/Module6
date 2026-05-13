import { hashPassword } from "../security/password";
import { PasswordResetRepository } from "../db/repositories/password-reset.repository";
import { UserRepository } from "../db/repositories/user.repository";
import { ApiError } from "./errors";
import { SessionRevocationService } from "./session-revocation.service";

export class PasswordResetConfirmService {
  constructor(
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionRevocationService: SessionRevocationService
  ) {}

  async execute(rawToken: string, newPassword: string): Promise<void> {
    const token = await this.passwordResetRepository.findActiveByRawToken(rawToken);
    if (!token) {
      throw new ApiError(400, "Invalid reset token");
    }

    const passwordHash = await hashPassword(newPassword);
    const updatedUser = await this.userRepository.updatePassword(token.userId, passwordHash);
    if (!updatedUser) {
      throw new ApiError(400, "Invalid reset token");
    }

    await this.sessionRevocationService.revokeAllForUser(token.userId);
    await this.passwordResetRepository.markUsed(token.tokenHash);
    await this.passwordResetRepository.invalidateSiblings(token.userId, token.tokenHash);
  }
}
