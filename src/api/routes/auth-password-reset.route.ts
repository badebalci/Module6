import { Router } from "express";
import { PasswordResetRequestService } from "../../services/password-reset-request.service";
import { PasswordResetConfirmService } from "../../services/password-reset-confirm.service";
import {
  passwordResetConfirmSchema,
  passwordResetRequestSchema
} from "../../validation/password-reset.schema";

/**
 * Creates password-reset request and confirmation routes.
 */
export function createAuthPasswordResetRoute(
  requestService: PasswordResetRequestService,
  confirmService: PasswordResetConfirmService
): Router {
  const router = Router();

  router.post("/password-reset/request", async (req, res, next) => {
    try {
      const body = passwordResetRequestSchema.parse(req.body);
      const result = await requestService.request(body.email, req.ip || "unknown");
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/password-reset/confirm", async (req, res, next) => {
    try {
      const body = passwordResetConfirmSchema.parse(req.body);
      const result = await confirmService.confirm(body.token, body.newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
