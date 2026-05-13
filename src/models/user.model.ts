export interface User {
  id: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface PublicUser {
  userId: string;
  email: string;
  tokenVersion: number;
}

export const toPublicUser = (user: User): PublicUser => ({
  userId: user.id,
  email: user.email,
  tokenVersion: user.tokenVersion
});
