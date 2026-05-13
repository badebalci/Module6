import { LoginBackoffService } from "../../../src/services/login-backoff.service";

describe("LoginBackoffService", () => {
  it("allows first attempt and blocks repeated failures with retry", async () => {
    const service = new LoginBackoffService();
    await service.ensureAllowed("user@example.com", "127.0.0.1");

    await service.recordFailure("user@example.com", "127.0.0.1");
    await service.ensureAllowed("user@example.com", "127.0.0.1");

    await service.recordFailure("user@example.com", "127.0.0.1");
    await expect(service.ensureAllowed("user@example.com", "127.0.0.1")).rejects.toThrow("TOO_MANY_ATTEMPTS:");
  });

  it("resets state after successful login", async () => {
    const service = new LoginBackoffService();
    await service.recordFailure("user@example.com", "127.0.0.1");
    await service.recordFailure("user@example.com", "127.0.0.1");

    await service.recordSuccess("user@example.com", "127.0.0.1");
    await expect(service.ensureAllowed("user@example.com", "127.0.0.1")).resolves.toBeUndefined();
  });
});
