import { UserRepository } from "../db/repositories/user.repository";
import { PublicUser, toPublicUser } from "../models/user.model";
import { hashPassword } from "../security/password";
import { ApiError } from "./errors";

export class RegisterService {
  constructor(private readonly userRepository: UserRepository) {}

  /** Registers a unique user and returns sanitized identity payload. */
  async execute(email: string, password: string): Promise<PublicUser> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ApiError(409, "Email already in use");
    }

    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.create(normalizedEmail, passwordHash);
    return toPublicUser(user);
  }
}
