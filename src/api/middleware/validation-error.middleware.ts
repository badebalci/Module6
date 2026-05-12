import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors";

/**
 * Maps Zod validation failures into a client-safe bad request error.
 */
export function validationErrorMiddleware(
  error: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (error instanceof ZodError) {
    next(new ApiError(400, "VALIDATION_ERROR", "Invalid request payload."));
    return;
  }
  next(error);
}
