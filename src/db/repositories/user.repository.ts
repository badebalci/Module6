import { randomUUID } from "crypto";
import { User } from "../../models/user.model";

const usersById = new Map<string, User>();
const usersByEmail = new Map<string, User>();

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return usersByEmail.get(normalizeEmail(email)) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return usersById.get(id) ?? null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const now = new Date();
    const user: User = {
      id: randomUUID(),
      email: normalizeEmail(email),
      passwordHash,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null
    };

    usersById.set(user.id, user);
    usersByEmail.set(user.email, user);
    return user;
  }

  async updateLastLoginAt(id: string): Promise<void> {
    const user = usersById.get(id);
    if (!user) return;
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
  }

  async incrementTokenVersion(id: string): Promise<User | null> {
    const user = usersById.get(id);
    if (!user) return null;
    user.tokenVersion += 1;
    user.updatedAt = new Date();
    return user;
  }

  async updatePassword(id: string, passwordHash: string): Promise<User | null> {
    const user = usersById.get(id);
    if (!user) return null;
    user.passwordHash = passwordHash;
    user.updatedAt = new Date();
    return user;
  }

  async clearAll(): Promise<void> {
    usersById.clear();
    usersByEmail.clear();
  }
}
