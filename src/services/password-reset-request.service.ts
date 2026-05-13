import { randomBytes } from "crypto";
import { env } from "../config/env";
import { PasswordResetRepository } from "../db/repositories/password-reset.repository";
import { UserRepository } from "../db/repositories/user.repository";
import { MailProvider } from "./mail.provider";

export class PasswordResetRequestService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly mailProvider: MailProvider
  ) {}

  async execute(email: string, requestIp: string | null): Promise<void> {
    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return;
    }

    const rawToken = randomBytes(32).toString("hex");
    const ttlMs = env.passwordResetTokenTtlMinutes * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttlMs);
    await this.passwordResetRepository.create(user.id, rawToken, expiresAt, requestIp);
    await this.mailProvider.sendPasswordResetEmail(user.email, rawToken);
  }
}
