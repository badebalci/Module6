import { LoginBackoffRepository } from "../db/repositories/password-reset.repository";

/** Backoff decision returned before credential verification. */
export interface BackoffDecision {
  blocked: boolean;
  retryAfterSeconds: number;
}

/**
 * Progressive backoff policy keyed by account identifier and source IP.
 */
export class LoginBackoffService {
  constructor(private readonly repo: LoginBackoffRepository) {}

  async enforceOrAllow(email: string, ipAddress: string): Promise<BackoffDecision> {
    const key = email.toLowerCase();
    const record = await this.repo.find(key, ipAddress);
    if (!record) {
      return { blocked: false, retryAfterSeconds: 0 };
    }

    const now = Date.now();
    if (record.nextAllowedAt.getTime() > now) {
      const retryAfter = Math.ceil((record.nextAllowedAt.getTime() - now) / 1000);
      return { blocked: true, retryAfterSeconds: retryAfter };
    }

    return { blocked: false, retryAfterSeconds: 0 };
  }

  async onFailedAttempt(email: string, ipAddress: string): Promise<void> {
    const key = email.toLowerCase();
    const current = await this.repo.find(key, ipAddress);
    const failureCount = (current?.failureCount ?? 0) + 1;
    const delaySeconds = Math.min(300, Math.pow(2, Math.min(failureCount, 8)));
    const nextAllowedAt = new Date(Date.now() + delaySeconds * 1000);
    await this.repo.recordFailure(key, ipAddress, failureCount, nextAllowedAt);
  }

  async onSuccessfulLogin(email: string, ipAddress: string): Promise<void> {
    await this.repo.clear(email.toLowerCase(), ipAddress);
  }
}
