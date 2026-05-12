import { LoginBackoffService } from "../../../src/services/login-backoff.service";
import { LoginService } from "../../../src/services/login.service";
import { UserRepository } from "../../../src/db/repositories/user.repository";
import { AuthSessionRepository } from "../../../src/db/repositories/auth-session.repository";
import { LoginBackoffRepository } from "../../../src/db/repositories/password-reset.repository";
import bcrypt from "bcrypt";

describe("LoginBackoffService", () => {
  const repo: jest.Mocked<LoginBackoffRepository> = {
    find: jest.fn(),
    recordFailure: jest.fn(),
    clear: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks requests until nextAllowedAt", async () => {
    repo.find.mockResolvedValue({
      emailKey: "user@example.com",
      ipAddress: "1.1.1.1",
      failureCount: 3,
      nextAllowedAt: new Date(Date.now() + 5000)
    });
    const service = new LoginBackoffService(repo);
    const decision = await service.enforceOrAllow("user@example.com", "1.1.1.1");
    expect(decision.blocked).toBe(true);
  });
});

describe("LoginService", () => {
  const users: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePasswordAndIncrementTokenVersion: jest.fn(),
    updateLastLogin: jest.fn()
  };
  const sessions: jest.Mocked<AuthSessionRepository> = {
    create: jest.fn(),
    isSessionActive: jest.fn(),
    revokeAllForUser: jest.fn()
  };
  const backoffRepo: jest.Mocked<LoginBackoffRepository> = {
    find: jest.fn(),
    recordFailure: jest.fn(),
    clear: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns JWT payload on valid credentials", async () => {
    const passwordHash = await bcrypt.hash("password", 4);
    users.findByEmail.mockResolvedValue({
      id: "user-id",
      email: "user@example.com",
      passwordHash,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null
    });
    const service = new LoginService(
      users,
      sessions,
      new LoginBackoffService(backoffRepo),
      "test-secret-test-secret",
      "24h"
    );

    const result = await service.login("user@example.com", "password", "1.1.1.1", "agent");
    expect(result.tokenType).toBe("Bearer");
    expect(result.accessToken).toBeTruthy();
    expect(sessions.create).toHaveBeenCalled();
  });
});
