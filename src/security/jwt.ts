import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthJwtPayload extends JwtPayload {
  sub: string;
  jti: string;
  tokenVersion: number;
}

/** Issues an access token for a user and session id pair. */
export const issueAccessToken = (userId: string, jwtId: string, tokenVersion: number): string => {
  const payload: AuthJwtPayload = {
    sub: userId,
    jti: jwtId,
    tokenVersion
  };

  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  } as SignOptions);
};

/** Verifies and decodes JWT payload. Throws when invalid/expired. */
export const verifyAccessToken = (token: string): AuthJwtPayload => {
  const decoded = jwt.verify(token, env.jwtSecret) as AuthJwtPayload;
  return decoded;
};
