import request from "supertest";
import { app } from "../../src/app";
import { resetInMemoryStores } from "../../src/api/routes";

describe("Contract POST /auth/register", () => {
  beforeEach(async () => {
    await resetInMemoryStores();
  });

  it("returns 201 schema fields", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "contract@example.com",
      password: "StrongPass123!"
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(String)
      })
    );
  });
});
