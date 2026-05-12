import { ApiError } from "../api/errors";
import { PasswordResetRepository } from "../db/repositories/password-reset.repository";
import { hashPassword } from "../security/password";
import { SessionRevocationService } from "./session-revocation.service";

/**
 * Handles password reset confirmation and one-time token consumption.
 */
export class PasswordResetConfirmService {
  constructor(
    private readonly resetRepo: PasswordResetRepository,
    private readonly revocationService: SessionRevocationService,
    private readonly bcryptRounds: number
  ) {}

  async confirm(token: string, newPassword: string): Promise<{ message: string }> {
    const resetToken = await this.resetRepo.findValidToken(token);
    if (!resetToken) {
      throw new ApiError(400, "INVALID_RESET_TOKEN", "Invalid or expired reset token.");
    }

    const passwordHash = await hashPassword(newPassword, this.bcryptRounds);
    await this.revocationService.revokeAllForUser(resetToken.userId, passwordHash);
    await this.resetRepo.markUsed(resetToken.id);
    await this.resetRepo.invalidateSiblingTokens(resetToken.userId, resetToken.id);

    return { message: "Password reset successful." };
  }
}
