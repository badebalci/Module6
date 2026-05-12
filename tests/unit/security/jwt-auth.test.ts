import { issueAuthToken, verifyAuthToken } from "../../../src/security/jwt";

describe("jwt auth", () => {
  it("issues and verifies token with tokenVersion", () => {
    const token = issueAuthToken(
      { sub: "user-1", jti: "jwt-1", tokenVersion: 2 },
      "test-secret-test-secret",
      "24h"
    );

    const decoded = verifyAuthToken(token, "test-secret-test-secret");
    expect(decoded.sub).toBe("user-1");
    expect(decoded.tokenVersion).toBe(2);
  });

  it("rejects tampered token", () => {
    expect(() => verifyAuthToken("abc.def.ghi", "test-secret-test-secret")).toThrow();
  });
});
