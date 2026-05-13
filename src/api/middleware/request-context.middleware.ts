import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);
  next();
};
