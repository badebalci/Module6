import { Router } from "express";
import { registerSchema } from "../../validation/register.schema";
import { RegisterService } from "../../services/register.service";

/**
 * Creates registration routes.
 */
export function createAuthRegisterRoute(registerService: RegisterService): Router {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const body = registerSchema.parse(req.body);
      const result = await registerService.register(body.email, body.password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
