import { PasswordResetRequestService } from "../../../src/services/password-reset-request.service";
import { PasswordResetConfirmService } from "../../../src/services/password-reset-confirm.service";
import { UserRepository } from "../../../src/db/repositories/user.repository";
import { PasswordResetRepository } from "../../../src/db/repositories/password-reset.repository";
import { MailProvider } from "../../../src/services/mail.provider";
import { SessionRevocationService } from "../../../src/services/session-revocation.service";

describe("PasswordReset services", () => {
  const users: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    updatePasswordAndIncrementTokenVersion: jest.fn()
  };
  const resetRepo: jest.Mocked<PasswordResetRepository> = {
    createToken: jest.fn(),
    findValidToken: jest.fn(),
    markUsed: jest.fn(),
    invalidateSiblingTokens: jest.fn()
  };
  const mailProvider: jest.Mocked<MailProvider> = {
    sendPasswordResetEmail: jest.fn()
  };
  const revocationService: jest.Mocked<SessionRevocationService> = {
    revokeAllForUser: jest.fn()
  } as unknown as jest.Mocked<SessionRevocationService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns generic success for unknown emails", async () => {
    users.findByEmail.mockResolvedValue(null);
    const service = new PasswordResetRequestService(users, resetRepo, mailProvider, 15);

    const result = await service.request("unknown@example.com", "1.1.1.1");
    expect(result.message).toMatch(/registered/i);
    expect(resetRepo.createToken).not.toHaveBeenCalled();
  });

  it("confirms valid token and revokes sessions", async () => {
    resetRepo.findValidToken.mockResolvedValue({
      id: "token-1",
      userId: "user-1",
      tokenHash: "hash",
      expiresAt: new Date(Date.now() + 60000),
      usedAt: null,
      invalidatedAt: null,
      createdAt: new Date()
    });

    const service = new PasswordResetConfirmService(resetRepo, revocationService, 4);
    const result = await service.confirm("valid-token-value", "newPass123!");

    expect(result.message).toMatch(/successful/i);
    expect(revocationService.revokeAllForUser).toHaveBeenCalledWith("user-1", expect.any(String));
    expect(resetRepo.markUsed).toHaveBeenCalledWith("token-1");
  });
});
