import { randomUUID } from "crypto";
import { AuthSessionRepository } from "../db/repositories/auth-session.repository";
import { UserRepository } from "../db/repositories/user.repository";
import { issueAccessToken } from "../security/jwt";
import { comparePassword } from "../security/password";
import { ApiError } from "./errors";
import { LoginBackoffService } from "./login-backoff.service";

interface LoginResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
}

export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly loginBackoffService: LoginBackoffService
  ) {}

  async execute(email: string, password: string, ip: string, userAgent: string | null): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();
    await this.loginBackoffService.ensureAllowed(normalizedEmail, ip);

    const user = await this.userRepository.findByEmail(normalizedEmail);
    const validPassword = user ? await comparePassword(password, user.passwordHash) : false;

    if (!user || !validPassword) {
      await this.loginBackoffService.recordFailure(normalizedEmail, ip);
      throw new ApiError(401, "Invalid email or password");
    }

    await this.loginBackoffService.recordSuccess(normalizedEmail, ip);
    const jwtId = randomUUID();
    const expiresInSeconds = 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.authSessionRepository.create(user.id, jwtId, ip, userAgent, expiresAt);
    await this.userRepository.updateLastLoginAt(user.id);

    const accessToken = issueAccessToken(user.id, jwtId, user.tokenVersion);
    return {
      accessToken,
      tokenType: "Bearer",
      expiresInSeconds
    };
  }
}
