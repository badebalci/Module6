import { issueAccessToken, verifyAccessToken } from "../../../src/security/jwt";

describe("JWT auth", () => {
  it("issues and verifies token with tokenVersion claim", () => {
    const token = issueAccessToken("user-1", "jwt-1", 3);
    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe("user-1");
    expect(payload.jti).toBe("jwt-1");
    expect(payload.tokenVersion).toBe(3);
  });
});
