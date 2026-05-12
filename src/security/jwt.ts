import jwt from "jsonwebtoken";

/** JWT payload used by auth middleware and services. */
export interface AuthJwtPayload {
  sub: string;
  jti: string;
  tokenVersion: number;
}

/**
 * Issues an authentication JWT containing user id and token version.
 */
export function issueAuthToken(
  payload: AuthJwtPayload,
  secret: string,
  expiresIn: string
): string {
  return jwt.sign(payload as object, secret as jwt.Secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"]
  });
}

/**
 * Verifies and decodes an authentication JWT.
 */
export function verifyAuthToken(token: string, secret: string): AuthJwtPayload {
  return jwt.verify(token, secret) as AuthJwtPayload;
}
