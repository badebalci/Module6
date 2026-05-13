import { createHash, randomUUID } from "crypto";
import { PasswordResetToken } from "../../models/password-reset-token.model";

const tokens = new Map<string, PasswordResetToken>();

export const hashResetToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export class PasswordResetRepository {
  async create(userId: string, rawToken: string, expiresAt: Date, requestIp: string | null): Promise<PasswordResetToken> {
    const tokenHash = hashResetToken(rawToken);
    const entry: PasswordResetToken = {
      id: randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
      invalidatedAt: null,
      createdAt: new Date(),
      requestIp
    };
    tokens.set(tokenHash, entry);
    return entry;
  }

  async findActiveByRawToken(rawToken: string): Promise<PasswordResetToken | null> {
    const tokenHash = hashResetToken(rawToken);
    const found = tokens.get(tokenHash) ?? null;
    if (!found) return null;
    if (found.usedAt || found.invalidatedAt) return null;
    if (found.expiresAt.getTime() < Date.now()) return null;
    return found;
  }

  async markUsed(tokenHash: string): Promise<void> {
    const found = tokens.get(tokenHash);
    if (!found) return;
    found.usedAt = new Date();
  }

  async invalidateSiblings(userId: string, excludeTokenHash: string): Promise<void> {
    const now = new Date();
    for (const token of tokens.values()) {
      if (token.userId === userId && token.tokenHash !== excludeTokenHash && !token.usedAt && !token.invalidatedAt) {
        token.invalidatedAt = now;
      }
    }
  }

  async clearAll(): Promise<void> {
    tokens.clear();
  }
}
