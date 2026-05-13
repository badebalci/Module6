import express from "express";
import { env } from "./config/env";
import { createApiRouter } from "./api/routes";
import { errorHandler } from "./api/middleware/error-handler.middleware";
import { requestContextMiddleware } from "./api/middleware/request-context.middleware";

export const app = express();
app.use(express.json());
app.use(requestContextMiddleware);
app.use(createApiRouter());
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Auth service listening on port ${env.port}`);
  });
}
