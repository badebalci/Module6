import request from "supertest";
import { app } from "../../src/app";
import { resetInMemoryStores } from "../../src/api/routes";

describe("Contract password reset endpoints", () => {
  beforeEach(async () => {
    await resetInMemoryStores();
  });

  it("request endpoint returns generic message shape", async () => {
    const response = await request(app).post("/auth/password-reset/request").send({
      email: "someone@example.com"
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.any(String)
      })
    );
  });

  it("confirm endpoint returns 400 for invalid token", async () => {
    const response = await request(app).post("/auth/password-reset/confirm").send({
      token: "bad-token",
      newPassword: "AnotherStrongPass123!"
    });

    expect(response.status).toBe(400);
  });
});
