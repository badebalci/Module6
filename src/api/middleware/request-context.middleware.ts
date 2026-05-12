import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

/**
 * Injects request correlation id for logs and tracing.
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}
