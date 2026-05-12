import { ApiError } from "../api/errors";
import { UserRepository } from "../db/repositories/user.repository";
import { RegisterResult } from "../models/user.model";
import { hashPassword } from "../security/password";

/**
 * Handles user registration and duplicate-email validation.
 */
export class RegisterService {
  constructor(private readonly userRepository: UserRepository, private readonly bcryptRounds: number) {}

  /**
   * Creates a new user if email is not already registered.
   */
  async register(email: string, password: string): Promise<RegisterResult> {
    const normalizedEmail = email.toLowerCase();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      console.info(JSON.stringify({ event: "register_failed_duplicate", email: normalizedEmail }));
      throw new ApiError(409, "EMAIL_IN_USE", "Email is already in use.");
    }

    const passwordHash = await hashPassword(password, this.bcryptRounds);
    const user = await this.userRepository.create(normalizedEmail, passwordHash);
    console.info(JSON.stringify({ event: "register_success", userId: user.id, email: user.email }));

    return {
      userId: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString()
    };
  }
}
