import { UserRepository } from "../../../src/db/repositories/user.repository";
import { RegisterService } from "../../../src/services/register.service";

describe("RegisterService", () => {
  it("creates a new unique user", async () => {
    const repo = new UserRepository();
    const service = new RegisterService(repo);

    const result = await service.execute("user@example.com", "StrongPass123!");

    expect(result.email).toBe("user@example.com");
    expect(result.userId).toBeTruthy();
  });

  it("throws on duplicate email", async () => {
    const repo = new UserRepository();
    const service = new RegisterService(repo);

    await service.execute("dup@example.com", "StrongPass123!");

    await expect(service.execute("dup@example.com", "StrongPass123!")).rejects.toMatchObject({
      statusCode: 409
    });
  });
});
