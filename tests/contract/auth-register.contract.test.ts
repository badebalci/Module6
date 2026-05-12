import express from "express";
import request from "supertest";
import { createAuthRegisterRoute } from "../../src/api/routes/auth-register.route";
import { errorHandlerMiddleware } from "../../src/api/middleware/error-handler.middleware";

describe("contract: POST /auth/register", () => {
  it("matches expected response fields", async () => {
    const app = express();
    app.use(express.json());
    app.use(
      "/auth",
      createAuthRegisterRoute({
        register: jest.fn().mockResolvedValue({
          userId: "u-1",
          email: "user@example.com",
          createdAt: new Date().toISOString()
        })
      } as any)
    );
    app.use(errorHandlerMiddleware);

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "user@example.com", password: "StrongPass123!" });

    expect(res.status).toBe(201);
    expect(Object.keys(res.body).sort()).toEqual(["createdAt", "email", "userId"]);
  });
});
