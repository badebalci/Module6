import { errorHandler } from "../../../src/api/middleware/error-handler.middleware";
import { ApiError } from "../../../src/services/errors";

const makeRes = () => {
  const payload: { statusCode?: number; body?: unknown } = {};
  const res = {
    status: jest.fn().mockImplementation((code: number) => {
      payload.statusCode = code;
      return res;
    }),
    json: jest.fn().mockImplementation((body: unknown) => {
      payload.body = body;
      return res;
    })
  };
  return { res, payload };
};

describe("errorHandler", () => {
  it("maps ApiError to status/message", () => {
    const { res, payload } = makeRes();

    errorHandler(new ApiError(409, "Conflict"), {} as never, res as never, (() => undefined) as never);

    expect(payload.statusCode).toBe(409);
    expect(payload.body).toEqual({ message: "Conflict" });
  });

  it("maps too-many-attempts errors to 429", () => {
    const { res, payload } = makeRes();

    errorHandler(new Error("TOO_MANY_ATTEMPTS:5"), {} as never, res as never, (() => undefined) as never);

    expect(payload.statusCode).toBe(429);
    expect(payload.body).toEqual(expect.objectContaining({ retryAfterSeconds: 5 }));
  });

  it("maps unknown errors to 500", () => {
    const { res, payload } = makeRes();

    errorHandler(new Error("boom"), {} as never, res as never, (() => undefined) as never);

    expect(payload.statusCode).toBe(500);
    expect(payload.body).toEqual({ message: "Internal server error" });
  });
});
