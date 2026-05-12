import express from "express";
import request from "supertest";
import { createAuthRegisterRoute } from "../../../src/api/routes/auth-register.route";
import { errorHandlerMiddleware } from "../../../src/api/middleware/error-handler.middleware";
import { validationErrorMiddleware } from "../../../src/api/middleware/validation-error.middleware";
import { RegisterService } from "../../../src/services/register.service";

describe("register integration", () => {
  it("returns 201 on successful registration", async () => {
    const service: Pick<RegisterService, "register"> = {
      register: jest.fn().mockResolvedValue({
        userId: "user-1",
        email: "user@example.com",
        createdAt: new Date().toISOString()
      })
    };

    const app = express();
    app.use(express.json());
    app.use("/auth", createAuthRegisterRoute(service as RegisterService));
    app.use(validationErrorMiddleware);
    app.use(errorHandlerMiddleware);

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "user@example.com", password: "StrongPass123!" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("userId");
  });

  it("returns 400 for invalid payload", async () => {
    const service: Pick<RegisterService, "register"> = {
      register: jest.fn()
    };
    const app = express();
    app.use(express.json());
    app.use("/auth", createAuthRegisterRoute(service as RegisterService));
    app.use(validationErrorMiddleware);
    app.use(errorHandlerMiddleware);

    const res = await request(app).post("/auth/register").send({ email: "bad", password: "123" });
    expect(res.status).toBe(400);
  });
});
