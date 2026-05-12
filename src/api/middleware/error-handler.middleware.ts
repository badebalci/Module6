import { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors";

/**
 * Centralized API error handler with auth-safe response mapping.
 */
export function errorHandlerMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message
    });
    return;
  }

  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred."
  });
}
