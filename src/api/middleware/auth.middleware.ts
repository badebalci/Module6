import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors";
import { verifyAuthToken } from "../../security/jwt";

/** Express request extension for decoded auth payload. */
export interface AuthenticatedRequest extends Request {
  auth?: {
    sub: string;
    jti: string;
    tokenVersion: number;
  };
}

/**
 * Bearer token authentication middleware.
 */
export function authMiddleware(jwtSecret: string) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next(new ApiError(401, "UNAUTHORIZED", "Authentication is required."));
      return;
    }

    const token = authHeader.slice("Bearer ".length);
    try {
      req.auth = verifyAuthToken(token, jwtSecret);
      next();
    } catch {
      next(new ApiError(401, "UNAUTHORIZED", "Authentication is required."));
    }
  };
}
