export interface MailProvider {
  sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<void>;
}

export class ConsoleMailProvider implements MailProvider {
  async sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<void> {
    // Intentionally minimal for local development.
    // eslint-disable-next-line no-console
    console.log(`Password reset token for ${toEmail}: ${resetToken}`);
  }
}
