import { UserRepository } from "../db/repositories/user.repository";
import { PublicUser, toPublicUser } from "../models/user.model";
import { ApiError } from "./errors";

export class MeService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }
    return toPublicUser(user);
  }
}
