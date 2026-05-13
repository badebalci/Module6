import { Router } from "express";
import { PasswordResetConfirmService } from "../../services/password-reset-confirm.service";
import { PasswordResetRequestService } from "../../services/password-reset-request.service";
import { withValidation } from "../middleware/validation-error.middleware";
import { passwordResetConfirmSchema, passwordResetRequestSchema } from "../../validation/password-reset.schema";

export const buildPasswordResetRoute = (
  passwordResetRequestService: PasswordResetRequestService,
  passwordResetConfirmService: PasswordResetConfirmService
): Router => {
  const router = Router();

  router.post(
    "/auth/password-reset/request",
    withValidation((body) => passwordResetRequestSchema.parse(body), async (req, res) => {
      await passwordResetRequestService.execute(req.body.email, req.ip || null);
      res.status(200).json({ message: "If the account exists, a reset email has been sent." });
    })
  );

  router.post(
    "/auth/password-reset/confirm",
    withValidation((body) => passwordResetConfirmSchema.parse(body), async (req, res) => {
      await passwordResetConfirmService.execute(req.body.token, req.body.newPassword);
      res.status(200).json({ message: "Password reset successful." });
    })
  );

  return router;
};
