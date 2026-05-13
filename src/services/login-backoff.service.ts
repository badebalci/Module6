import { randomUUID } from "crypto";
import { LoginAttemptBackoff } from "../models/session.model";

const records = new Map<string, LoginAttemptBackoff>();

const makeKey = (email: string, ip: string): string => `${email.trim().toLowerCase()}|${ip}`;

const computeDelaySeconds = (failureCount: number): number => {
  if (failureCount <= 1) return 0;
  return Math.min(60, 2 ** (failureCount - 1));
};

export class LoginBackoffService {
  async ensureAllowed(email: string, ip: string): Promise<void> {
    const key = makeKey(email, ip);
    const record = records.get(key);
    if (!record) return;
    if (record.nextAllowedAt.getTime() > Date.now()) {
      const retryAfterMs = record.nextAllowedAt.getTime() - Date.now();
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
      throw new Error(`TOO_MANY_ATTEMPTS:${retryAfterSeconds}`);
    }
  }

  async recordFailure(email: string, ip: string): Promise<void> {
    const key = makeKey(email, ip);
    const now = new Date();
    const existing = records.get(key);

    if (!existing) {
      records.set(key, {
        id: randomUUID(),
        emailKey: email.trim().toLowerCase(),
        ipAddress: ip,
        failureCount: 1,
        nextAllowedAt: now,
        lastFailedAt: now,
        createdAt: now,
        updatedAt: now
      });
      return;
    }

    existing.failureCount += 1;
    existing.lastFailedAt = now;
    existing.updatedAt = now;
    const delaySeconds = computeDelaySeconds(existing.failureCount);
    existing.nextAllowedAt = new Date(now.getTime() + delaySeconds * 1000);
  }

  async recordSuccess(email: string, ip: string): Promise<void> {
    records.delete(makeKey(email, ip));
  }

  async clearAll(): Promise<void> {
    records.clear();
  }
}
