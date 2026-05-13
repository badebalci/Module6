import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../../services/errors";

export const withValidation =
  <T>(validator: (input: unknown) => T, handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = validator(req.body);
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ApiError(400, "Invalid request"));
        return;
      }
      next(error);
    }
  };
