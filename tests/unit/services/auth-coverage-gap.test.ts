import { comparePassword, hashPassword } from "../../../src/security/password";

describe("Auth utility coverage", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("StrongPass123!");
    const ok = await comparePassword("StrongPass123!", hash);
    const bad = await comparePassword("wrong", hash);

    expect(ok).toBe(true);
    expect(bad).toBe(false);
  });
});
