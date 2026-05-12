/**
 * Abstraction over outbound email delivery for password reset flow.
 */
export interface MailProvider {
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

/**
 * Logging mail adapter used as a default placeholder in development.
 */
export class ConsoleMailProvider implements MailProvider {
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Structured log-style output for traceability in local/dev environments.
    // eslint-disable-next-line no-console
    console.info(JSON.stringify({ event: "password_reset_email", email, tokenPreview: token.slice(0, 6) }));
  }
}
