import { hashResetToken } from "../../../src/db/repositories/password-reset.repository";

describe("Password reset token hashing", () => {
  it("is deterministic for the same token", () => {
    const token = "abc123";
    expect(hashResetToken(token)).toBe(hashResetToken(token));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashResetToken("a")).not.toBe(hashResetToken("b"));
  });
});
