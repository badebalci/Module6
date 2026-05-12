import { randomBytes } from "crypto";
import { PasswordResetRepository } from "../db/repositories/password-reset.repository";
import { UserRepository } from "../db/repositories/user.repository";
import { MailProvider } from "./mail.provider";

/**
 * Handles password reset request generation with anti-enumeration response semantics.
 */
export class PasswordResetRequestService {
  constructor(
    private readonly users: UserRepository,
    private readonly resets: PasswordResetRepository,
    private readonly mailProvider: MailProvider,
    private readonly tokenTtlMinutes: number
  ) {}

  async request(email: string, requestIp?: string): Promise<{ message: string }> {
    const user = await this.users.findByEmail(email.toLowerCase());

    if (user) {
      const token = randomBytes(24).toString("hex");
      const expiresAt = new Date(Date.now() + this.tokenTtlMinutes * 60 * 1000);
      await this.resets.createToken(user.id, token, expiresAt, requestIp);
      await this.mailProvider.sendPasswordResetEmail(user.email, token);
    }

    return {
      message: "If the email is registered, password reset instructions have been sent."
    };
  }
}
