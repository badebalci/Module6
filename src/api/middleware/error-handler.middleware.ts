import { NextFunction, Request, Response } from "express";
import { ApiError } from "../../services/errors";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof Error && error.message.startsWith("TOO_MANY_ATTEMPTS:")) {
    const retryAfter = Number(error.message.split(":")[1] ?? "1");
    res.status(429).json({ message: "Too many attempts. Retry later.", retryAfterSeconds: retryAfter });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
};
