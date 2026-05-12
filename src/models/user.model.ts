/** User account persisted by the authentication system. */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/** Registration response DTO returned by API. */
export interface RegisterResult {
  userId: string;
  email: string;
  createdAt: string;
}
