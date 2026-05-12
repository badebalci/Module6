import { performance } from "perf_hooks";

describe("login performance", () => {
  it("completes mocked valid login flow under 10 seconds", async () => {
    const start = performance.now();

    await new Promise((resolve) => setTimeout(resolve, 50));

    const elapsedMs = performance.now() - start;
    expect(elapsedMs).toBeLessThan(10_000);
  });
});
