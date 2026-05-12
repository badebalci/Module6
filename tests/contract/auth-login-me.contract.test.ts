import express from "express";
import request from "supertest";
import { createAuthLoginRoute } from "../../src/api/routes/auth-login.route";
import { errorHandlerMiddleware } from "../../src/api/middleware/error-handler.middleware";
import { issueAuthToken } from "../../src/security/jwt";

describe("contract: POST /auth/login and GET /auth/me", () => {
  it("returns expected login payload shape", async () => {
    const app = express();
    app.use(express.json());
    app.use(
      "/auth",
      createAuthLoginRoute(
        {
          login: jest.fn().mockResolvedValue({
            accessToken: "token",
            tokenType: "Bearer",
            expiresInSeconds: 86400
          })
        } as any,
        {
          getProfile: jest.fn().mockResolvedValue({
            userId: "u-1",
            email: "user@example.com",
            tokenVersion: 0
          })
        } as any,
        "secret-secret-secret"
      )
    );
    app.use(errorHandlerMiddleware);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "password" });

    expect(loginRes.status).toBe(200);
    expect(Object.keys(loginRes.body).sort()).toEqual(["accessToken", "expiresInSeconds", "tokenType"]);
  });

  it("returns expected /me payload shape", async () => {
    const token = issueAuthToken({ sub: "u-1", jti: "jwt-1", tokenVersion: 0 }, "secret-secret-secret", "24h");
    const app = express();
    app.use(express.json());
    app.use(
      "/auth",
      createAuthLoginRoute(
        { login: jest.fn() } as any,
        {
          getProfile: jest.fn().mockResolvedValue({
            userId: "u-1",
            email: "user@example.com",
            tokenVersion: 0
          })
        } as any,
        "secret-secret-secret"
      )
    );
    app.use(errorHandlerMiddleware);

    const meRes = await request(app).get("/auth/me").set("authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(Object.keys(meRes.body).sort()).toEqual(["email", "tokenVersion", "userId"]);
  });
});
