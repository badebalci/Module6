import { PasswordResetRepository } from "../../../src/db/repositories/password-reset.repository";
import { AuthSessionRepository } from "../../../src/db/repositories/auth-session.repository";
import { UserRepository } from "../../../src/db/repositories/user.repository";
import { PasswordResetConfirmService } from "../../../src/services/password-reset-confirm.service";
import { PasswordResetRequestService } from "../../../src/services/password-reset-request.service";
import { RegisterService } from "../../../src/services/register.service";
import { SessionRevocationService } from "../../../src/services/session-revocation.service";

class FakeMailProvider {
  public sentToken: string | null = null;

  async sendPasswordResetEmail(_toEmail: string, resetToken: string): Promise<void> {
    this.sentToken = resetToken;
  }
}

describe("Password reset services", () => {
  it("requests and confirms reset with one-time token", async () => {
    const userRepo = new UserRepository();
    const passwordResetRepo = new PasswordResetRepository();
    const sessionRepo = new AuthSessionRepository();
    const registerService = new RegisterService(userRepo);
    const mailProvider = new FakeMailProvider();

    await registerService.execute("reset@example.com", "StrongPass123!");

    const requestService = new PasswordResetRequestService(userRepo, passwordResetRepo, mailProvider);
    const confirmService = new PasswordResetConfirmService(
      passwordResetRepo,
      userRepo,
      new SessionRevocationService(userRepo, sessionRepo)
    );

    await requestService.execute("reset@example.com", "127.0.0.1");
    expect(mailProvider.sentToken).toBeTruthy();

    await expect(confirmService.execute(mailProvider.sentToken as string, "NewStrongPass123!")).resolves.toBeUndefined();
    await expect(confirmService.execute(mailProvider.sentToken as string, "AnotherStrongPass123!")).rejects.toMatchObject({
      statusCode: 400
    });
  });
});
