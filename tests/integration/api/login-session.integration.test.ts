import express from "express";
import request from "supertest";
import { createAuthLoginRoute } from "../../../src/api/routes/auth-login.route";
import { errorHandlerMiddleware } from "../../../src/api/middleware/error-handler.middleware";
import { LoginService } from "../../../src/services/login.service";
import { MeService } from "../../../src/services/me.service";
import { issueAuthToken } from "../../../src/security/jwt";

describe("login/session integration", () => {
  it("logs in and accesses /me with valid JWT", async () => {
    const loginService: Pick<LoginService, "login"> = {
      login: jest.fn().mockResolvedValue({
        accessToken: issueAuthToken({ sub: "user-1", jti: "jwt-1", tokenVersion: 0 }, "secret-secret-secret", "24h"),
        tokenType: "Bearer",
        expiresInSeconds: 86400
      })
    };

    const meService: Pick<MeService, "getProfile"> = {
      getProfile: jest.fn().mockResolvedValue({
        userId: "user-1",
        email: "user@example.com",
        tokenVersion: 0
      })
    };

    const app = express();
    app.use(express.json());
    app.use("/auth", createAuthLoginRoute(loginService as LoginService, meService as MeService, "secret-secret-secret"));
    app.use(errorHandlerMiddleware);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "password" });

    expect(loginRes.status).toBe(200);

    const meRes = await request(app)
      .get("/auth/me")
      .set("authorization", `Bearer ${loginRes.body.accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.userId).toBe("user-1");
  });
});
