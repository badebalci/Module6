import { AuthSessionRepository } from "../../../src/db/repositories/auth-session.repository";
import { UserRepository } from "../../../src/db/repositories/user.repository";
import { LoginBackoffService } from "../../../src/services/login-backoff.service";
import { LoginService } from "../../../src/services/login.service";
import { RegisterService } from "../../../src/services/register.service";

describe("LoginService", () => {
  it("returns access token for valid credentials", async () => {
    const userRepo = new UserRepository();
    const registerService = new RegisterService(userRepo);
    await registerService.execute("login@example.com", "StrongPass123!");

    const loginService = new LoginService(userRepo, new AuthSessionRepository(), new LoginBackoffService());
    const result = await loginService.execute("login@example.com", "StrongPass123!", "127.0.0.1", null);

    expect(result.accessToken).toBeTruthy();
    expect(result.expiresInSeconds).toBe(86400);
  });

  it("rejects invalid credentials", async () => {
    const userRepo = new UserRepository();
    const loginService = new LoginService(userRepo, new AuthSessionRepository(), new LoginBackoffService());

    await expect(loginService.execute("invalid@example.com", "wrong", "127.0.0.1", null)).rejects.toMatchObject({
      statusCode: 401
    });
  });
});
