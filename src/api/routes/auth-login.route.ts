import { Router } from "express";
import { LoginService } from "../../services/login.service";
import { MeService } from "../../services/me.service";
import { withValidation } from "../middleware/validation-error.middleware";
import { loginSchema } from "../../validation/login.schema";

export const buildLoginRoute = (loginService: LoginService, meService: MeService): Router => {
  const router = Router();

  router.post(
    "/auth/login",
    withValidation((body) => loginSchema.parse(body), async (req, res) => {
      const ip = req.ip || "127.0.0.1";
      const userAgent = req.header("user-agent") ?? null;
      const result = await loginService.execute(req.body.email, req.body.password, ip, userAgent);
      res.status(200).json(result);
    })
  );

  router.get("/auth/me", async (req, res, next) => {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const me = await meService.execute(auth.userId);
      res.status(200).json(me);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
