import { isPasswordResetTokenActive } from "../../../src/security/password-reset-token";

describe("password reset token lifecycle", () => {
  const baseToken = {
    id: "id",
    userId: "user",
    tokenHash: "hash",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5000),
    usedAt: null,
    invalidatedAt: null
  };

  it("accepts active token", () => {
    expect(isPasswordResetTokenActive(baseToken)).toBe(true);
  });

  it("rejects used token", () => {
    expect(
      isPasswordResetTokenActive({
        ...baseToken,
        usedAt: new Date()
      })
    ).toBe(false);
  });

  it("rejects expired token", () => {
    expect(
      isPasswordResetTokenActive(
        {
          ...baseToken,
          expiresAt: new Date(Date.now() - 5000)
        },
        new Date()
      )
    ).toBe(false);
  });
});
