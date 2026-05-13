import request from "supertest";
import { app } from "../../src/app";
import { resetInMemoryStores } from "../../src/api/routes";

describe("Contract POST /auth/login and GET /auth/me", () => {
  beforeEach(async () => {
    await resetInMemoryStores();
  });

  it("returns expected login response schema", async () => {
    await request(app).post("/auth/register").send({ email: "logincontract@example.com", password: "StrongPass123!" });

    const loginResponse = await request(app).post("/auth/login").send({
      email: "logincontract@example.com",
      password: "StrongPass123!"
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        tokenType: "Bearer",
        expiresInSeconds: 86400
      })
    );
  });

  it("returns expected me response schema", async () => {
    await request(app).post("/auth/register").send({ email: "mecontract@example.com", password: "StrongPass123!" });
    const loginResponse = await request(app).post("/auth/login").send({
      email: "mecontract@example.com",
      password: "StrongPass123!"
    });

    const meResponse = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        email: expect.any(String),
        tokenVersion: expect.any(Number)
      })
    );
  });
});
