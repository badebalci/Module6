import { Router } from "express";
import { createAuthRegisterRoute } from "./auth-register.route";
import { createAuthLoginRoute } from "./auth-login.route";
import { createAuthPasswordResetRoute } from "./auth-password-reset.route";
import { RegisterService } from "../../services/register.service";
import { LoginService } from "../../services/login.service";
import { MeService } from "../../services/me.service";
import { PasswordResetRequestService } from "../../services/password-reset-request.service";
import { PasswordResetConfirmService } from "../../services/password-reset-confirm.service";

/** Route dependencies required to build auth API router. */
export interface AuthRouteDeps {
  registerService: RegisterService;
  loginService: LoginService;
  meService: MeService;
  passwordResetRequestService: PasswordResetRequestService;
  passwordResetConfirmService: PasswordResetConfirmService;
  jwtSecret: string;
}

/**
 * Builds the API router for all auth endpoints.
 */
export function createApiRouter(deps: AuthRouteDeps): Router {
  const router = Router();

  router.use("/auth", createAuthRegisterRoute(deps.registerService));
  router.use("/auth", createAuthLoginRoute(deps.loginService, deps.meService, deps.jwtSecret));
  router.use(
    "/auth",
    createAuthPasswordResetRoute(deps.passwordResetRequestService, deps.passwordResetConfirmService)
  );

  return router;
}
