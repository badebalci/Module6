import express from "express";
import request from "supertest";
import { createAuthPasswordResetRoute } from "../../../src/api/routes/auth-password-reset.route";
import { PasswordResetRequestService } from "../../../src/services/password-reset-request.service";
import { PasswordResetConfirmService } from "../../../src/services/password-reset-confirm.service";
import { errorHandlerMiddleware } from "../../../src/api/middleware/error-handler.middleware";

describe("password reset integration", () => {
  it("returns generic success for request and success for confirm", async () => {
    const requestService: Pick<PasswordResetRequestService, "request"> = {
      request: jest.fn().mockResolvedValue({
        message: "If the email is registered, password reset instructions have been sent."
      })
    };

    const confirmService: Pick<PasswordResetConfirmService, "confirm"> = {
      confirm: jest.fn().mockResolvedValue({ message: "Password reset successful." })
    };

    const app = express();
    app.use(express.json());
    app.use(
      "/auth",
      createAuthPasswordResetRoute(
        requestService as PasswordResetRequestService,
        confirmService as PasswordResetConfirmService
      )
    );
    app.use(errorHandlerMiddleware);

    const requestRes = await request(app)
      .post("/auth/password-reset/request")
      .send({ email: "user@example.com" });
    expect(requestRes.status).toBe(200);

    const confirmRes = await request(app)
      .post("/auth/password-reset/confirm")
      .send({ token: "a1234567890123456", newPassword: "NewStrong123!" });
    expect(confirmRes.status).toBe(200);
  });
});
