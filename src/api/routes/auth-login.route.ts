import { Router } from "express";
import { LoginService } from "../../services/login.service";
import { MeService } from "../../services/me.service";
import { loginSchema } from "../../validation/login.schema";
import { AuthenticatedRequest, authMiddleware } from "../middleware/auth.middleware";

/**
 * Creates login and authenticated profile routes.
 */
export function createAuthLoginRoute(
  loginService: LoginService,
  meService: MeService,
  jwtSecret: string
): Router {
  const router = Router();

  router.post("/login", async (req, res, next) => {
    try {
      const body = loginSchema.parse(req.body);
      const ip = req.ip || "unknown";
      const result = await loginService.login(body.email, body.password, ip, req.header("user-agent") || undefined);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", authMiddleware(jwtSecret), async (req: AuthenticatedRequest, res, next) => {
    try {
      const profile = await meService.getProfile(req.auth!);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
