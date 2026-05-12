import express from "express";
import { loadEnv } from "./config/env";
import { DbClient } from "./db/client";
import { PgUserRepository } from "./db/repositories/user.repository";
import { PgPasswordResetRepository } from "./db/repositories/password-reset.repository";
import { PgAuthSessionRepository } from "./db/repositories/auth-session.repository";
import { ConsoleMailProvider } from "./services/mail.provider";
import { RegisterService } from "./services/register.service";
import { LoginBackoffService } from "./services/login-backoff.service";
import { LoginService } from "./services/login.service";
import { MeService } from "./services/me.service";
import { SessionRevocationService } from "./services/session-revocation.service";
import { PasswordResetRequestService } from "./services/password-reset-request.service";
import { PasswordResetConfirmService } from "./services/password-reset-confirm.service";
import { createApiRouter } from "./api/routes";
import { requestContextMiddleware } from "./api/middleware/request-context.middleware";
import { validationErrorMiddleware } from "./api/middleware/validation-error.middleware";
import { errorHandlerMiddleware } from "./api/middleware/error-handler.middleware";

/**
 * Builds an Express app with concrete dependencies.
 */
export function createApp() {
  const env = loadEnv();

  const db = new DbClient(env.DATABASE_URL);
  const userRepo = new PgUserRepository(db);
  const resetRepo = new PgPasswordResetRepository(db);
  const sessionRepo = new PgAuthSessionRepository(db);

  const registerService = new RegisterService(userRepo, env.BCRYPT_ROUNDS);
  const backoffService = new LoginBackoffService(resetRepo);
  const loginService = new LoginService(userRepo, sessionRepo, backoffService, env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const meService = new MeService(userRepo, sessionRepo);
  const revocationService = new SessionRevocationService(userRepo, sessionRepo);
  const requestService = new PasswordResetRequestService(
    userRepo,
    resetRepo,
    new ConsoleMailProvider(),
    env.PASSWORD_RESET_TOKEN_TTL_MINUTES
  );
  const confirmService = new PasswordResetConfirmService(resetRepo, revocationService, env.BCRYPT_ROUNDS);

  const app = express();
  app.use(express.json());
  app.use(requestContextMiddleware);

  app.use(
    createApiRouter({
      registerService,
      loginService,
      meService,
      passwordResetRequestService: requestService,
      passwordResetConfirmService: confirmService,
      jwtSecret: env.JWT_SECRET
    })
  );

  app.use(validationErrorMiddleware);
  app.use(errorHandlerMiddleware);

  return { app, db, env };
}

if (require.main === module) {
  const { app, env } = createApp();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.info(`Auth service listening on port ${env.PORT}`);
  });
}
