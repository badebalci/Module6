import request from "supertest";
import { app } from "../../../src/app";
import { resetInMemoryStores } from "../../../src/api/routes";

describe("Login + session endpoints", () => {
  beforeEach(async () => {
    await resetInMemoryStores();
  });

  it("logs in and returns profile on /auth/me", async () => {
    await request(app).post("/auth/register").send({
      email: "me@example.com",
      password: "StrongPass123!"
    });

    const loginResponse = await request(app).post("/auth/login").send({
      email: "me@example.com",
      password: "StrongPass123!"
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeTruthy();

    const meResponse = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        email: "me@example.com",
        tokenVersion: 0
      })
    );
  });

  it("denies /auth/me without token", async () => {
    const response = await request(app).get("/auth/me");
    expect(response.status).toBe(401);
  });
});
