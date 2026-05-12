import { LoginBackoffService } from "../../../src/services/login-backoff.service";
import { LoginBackoffRepository } from "../../../src/db/repositories/password-reset.repository";

describe("coverage gap tests", () => {
  it("clears counters on successful login", async () => {
    const repo: jest.Mocked<LoginBackoffRepository> = {
      find: jest.fn(),
      recordFailure: jest.fn(),
      clear: jest.fn()
    };

    const service = new LoginBackoffService(repo);
    await service.onSuccessfulLogin("user@example.com", "2.2.2.2");

    expect(repo.clear).toHaveBeenCalledWith("user@example.com", "2.2.2.2");
  });
});
