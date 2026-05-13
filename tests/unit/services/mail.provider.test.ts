import { ConsoleMailProvider } from "../../../src/services/mail.provider";

describe("ConsoleMailProvider", () => {
  it("resolves send call", async () => {
    const provider = new ConsoleMailProvider();
    await expect(provider.sendPasswordResetEmail("mail@example.com", "token")).resolves.toBeUndefined();
  });
});
