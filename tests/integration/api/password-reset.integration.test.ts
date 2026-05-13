import request from "supertest";
import { app } from "../../../src/app";
import { resetInMemoryStores } from "../../../src/api/routes";

describe("Password reset endpoints", () => {
  beforeEach(async () => {
    await resetInMemoryStores();
  });

  it("returns generic success for request", async () => {
    const response = await request(app).post("/auth/password-reset/request").send({
      email: "unknown@example.com"
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/reset email has been sent/i);
  });

  it("returns 400 for invalid confirmation token", async () => {
    const response = await request(app).post("/auth/password-reset/confirm").send({
      token: "invalid",
      newPassword: "NewStrongPass123!"
    });

    expect(response.status).toBe(400);
  });
});
