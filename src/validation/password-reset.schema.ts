import { z } from "zod";

/** Password reset request schema. */
export const passwordResetRequestSchema = z.object({
  email: z.string().email()
});

/** Password reset confirmation schema. */
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(16),
  newPassword: z.string().min(8)
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
