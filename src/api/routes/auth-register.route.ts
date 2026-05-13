import { Router } from "express";
import { RegisterService } from "../../services/register.service";
import { withValidation } from "../middleware/validation-error.middleware";
import { registerSchema } from "../../validation/register.schema";

export const buildRegisterRoute = (registerService: RegisterService): Router => {
  const router = Router();

  router.post(
    "/auth/register",
    withValidation((body) => registerSchema.parse(body), async (req, res) => {
      const created = await registerService.execute(req.body.email, req.body.password);
      res.status(201).json({
        userId: created.userId,
        email: created.email,
        createdAt: new Date().toISOString()
      });
    })
  );

  return router;
};
