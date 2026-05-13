import { Router } from "express";
import { AuthSessionRepository } from "../../db/repositories/auth-session.repository";
import { PasswordResetRepository } from "../../db/repositories/password-reset.repository";
import { UserRepository } from "../../db/repositories/user.repository";
import { ConsoleMailProvider } from "../../services/mail.provider";
import { LoginBackoffService } from "../../services/login-backoff.service";
import { LoginService } from "../../services/login.service";
import { MeService } from "../../services/me.service";
import { PasswordResetConfirmService } from "../../services/password-reset-confirm.service";
import { PasswordResetRequestService } from "../../services/password-reset-request.service";
import { RegisterService } from "../../services/register.service";
import { SessionRevocationService } from "../../services/session-revocation.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { buildLoginRoute } from "./auth-login.route";
import { buildPasswordResetRoute } from "./auth-password-reset.route";
import { buildRegisterRoute } from "./auth-register.route";

const userRepository = new UserRepository();
const authSessionRepository = new AuthSessionRepository();
const passwordResetRepository = new PasswordResetRepository();
const loginBackoffService = new LoginBackoffService();
const mailProvider = new ConsoleMailProvider();

const registerService = new RegisterService(userRepository);
const loginService = new LoginService(userRepository, authSessionRepository, loginBackoffService);
const meService = new MeService(userRepository);
const sessionRevocationService = new SessionRevocationService(userRepository, authSessionRepository);
const passwordResetRequestService = new PasswordResetRequestService(userRepository, passwordResetRepository, mailProvider);
const passwordResetConfirmService = new PasswordResetConfirmService(passwordResetRepository, userRepository, sessionRevocationService);

export const resetInMemoryStores = async (): Promise<void> => {
  await userRepository.clearAll();
  await authSessionRepository.clearAll();
  await passwordResetRepository.clearAll();
  await loginBackoffService.clearAll();
};

export const createApiRouter = (): Router => {
  const router = Router();

  router.use(buildRegisterRoute(registerService));
  router.use("/auth/me", authMiddleware(userRepository, authSessionRepository));
  router.use(buildLoginRoute(loginService, meService));
  router.use(buildPasswordResetRoute(passwordResetRequestService, passwordResetConfirmService));

  return router;
};
