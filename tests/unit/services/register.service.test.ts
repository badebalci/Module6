import { RegisterService } from "../../../src/services/register.service";
import { UserRepository } from "../../../src/db/repositories/user.repository";

describe("RegisterService", () => {
  const userRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    updatePasswordAndIncrementTokenVersion: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new user when email is unique", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      passwordHash: "hash",
      tokenVersion: 0,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      lastLoginAt: null
    });

    const service = new RegisterService(userRepository, 4);
    const result = await service.register("User@Example.com", "StrongPass123!");

    expect(result.userId).toBe("user-1");
    expect(result.email).toBe("user@example.com");
    expect(userRepository.create).toHaveBeenCalledWith("user@example.com", expect.any(String));
  });

  it("rejects duplicate email", async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: "existing",
      email: "user@example.com",
      passwordHash: "hash",
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null
    });

    const service = new RegisterService(userRepository, 4);
    await expect(service.register("user@example.com", "StrongPass123!")).rejects.toMatchObject({
      status: 409,
      code: "EMAIL_IN_USE"
    });
  });
});
