import express from "express";
import request from "supertest";
import { createAuthPasswordResetRoute } from "../../src/api/routes/auth-password-reset.route";
import { errorHandlerMiddleware } from "../../src/api/middleware/error-handler.middleware";

describe("contract: password reset endpoints", () => {
  it("matches request endpoint response shape", async () => {
    const app = express();
    app.use(express.json());
    app.use(
      "/auth",
      createAuthPasswordResetRoute(
        {
          request: jest.fn().mockResolvedValue({ message: "If the email is registered, password reset instructions have been sent." })
        } as any,
        {
          confirm: jest.fn().mockResolvedValue({ message: "Password reset successful." })
        } as any
      )
    );
    app.use(errorHandlerMiddleware);

    const reqRes = await request(app)
      .post("/auth/password-reset/request")
      .send({ email: "user@example.com" });

    expect(reqRes.status).toBe(200);
    expect(Object.keys(reqRes.body)).toEqual(["message"]);
  });

  it("matches confirm endpoint response shape", async () => {
    const app = express();
    app.use(express.json());
    app.use(
      "/auth",
      createAuthPasswordResetRoute(
        { request: jest.fn() } as any,
        { confirm: jest.fn().mockResolvedValue({ message: "Password reset successful." }) } as any
      )
    );
    app.use(errorHandlerMiddleware);

    const res = await request(app)
      .post("/auth/password-reset/confirm")
      .send({ token: "a1234567890123456", newPassword: "NewStrong123!" });

    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(["message"]);
  });
});
