import { randomUUID } from "crypto";
import { ApiError } from "../api/errors";
import { AuthSessionRepository } from "../db/repositories/auth-session.repository";
import { UserRepository } from "../db/repositories/user.repository";
import { comparePassword } from "../security/password";
import { issueAuthToken } from "../security/jwt";
import { LoginBackoffService } from "./login-backoff.service";

/** Successful login payload returned to API clients. */
export interface LoginResult {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
}

/**
 * Orchestrates login: backoff checks, credential validation, session persistence, and JWT issuance.
 */
export class LoginService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: AuthSessionRepository,
    private readonly backoffService: LoginBackoffService,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string
  ) {}

  async login(email: string, password: string, ipAddress: string, userAgent?: string): Promise<LoginResult> {
    const decision = await this.backoffService.enforceOrAllow(email, ipAddress);
    if (decision.blocked) {
      throw new ApiError(429, "AUTH_RETRY_LATER", "Too many attempts. Try again later.");
    }

    const user = await this.users.findByEmail(email.toLowerCase());
    const invalidCredentials = !user || !(await comparePassword(password, user.passwordHash));
    if (invalidCredentials) {
      await this.backoffService.onFailedAttempt(email, ipAddress);
      throw new ApiError(401, "AUTH_FAILED", "Invalid email or password.");
    }

    await this.backoffService.onSuccessfulLogin(email, ipAddress);

    const jwtId = randomUUID();
    const expiresInSeconds = 60 * 60 * 24;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.sessions.create(user.id, jwtId, expiresAt, ipAddress, userAgent);
    await this.users.updateLastLogin(user.id);

    const accessToken = issueAuthToken(
      {
        sub: user.id,
        jti: jwtId,
        tokenVersion: user.tokenVersion
      },
      this.jwtSecret,
      this.jwtExpiresIn
    );

    return {
      accessToken,
      tokenType: "Bearer",
      expiresInSeconds
    };
  }
}
