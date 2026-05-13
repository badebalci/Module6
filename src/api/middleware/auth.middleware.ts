import { NextFunction, Request, Response } from "express";
import { AuthSessionRepository } from "../../db/repositories/auth-session.repository";
import { UserRepository } from "../../db/repositories/user.repository";
import { verifyAccessToken } from "../../security/jwt";
import { ApiError } from "../../services/errors";

export const authMiddleware =
  (userRepository: UserRepository, authSessionRepository: AuthSessionRepository) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized");
      }

      const token = authHeader.substring("Bearer ".length);
      const payload = verifyAccessToken(token);

      const session = await authSessionRepository.findByJwtId(payload.jti);
      if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
        throw new ApiError(401, "Unauthorized");
      }

      const user = await userRepository.findById(payload.sub);
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new ApiError(401, "Unauthorized");
      }

      req.auth = {
        userId: payload.sub,
        jwtId: payload.jti,
        tokenVersion: payload.tokenVersion
      };

      next();
    } catch (_error) {
      next(new ApiError(401, "Unauthorized"));
    }
  };
