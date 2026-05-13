import request from "supertest";
import { app } from "../../../src/app";
import { resetInMemoryStores } from "../../../src/api/routes";

describe("POST /auth/register", () => {
  beforeEach(async () => {
    await resetInMemoryStores();
  });

  it("returns 201 for valid unique registration", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "new@example.com",
      password: "StrongPass123!"
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        email: "new@example.com",
        userId: expect.any(String),
        createdAt: expect.any(String)
      })
    );
  });

  it("returns 409 for duplicate email", async () => {
    await request(app).post("/auth/register").send({
      email: "dup@example.com",
      password: "StrongPass123!"
    });

    const response = await request(app).post("/auth/register").send({
      email: "dup@example.com",
      password: "StrongPass123!"
    });

    expect(response.status).toBe(409);
  });
});
