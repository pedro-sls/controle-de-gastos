import { z } from "zod";

const emailSchema = z
  .string({ error: "Informe seu e-mail." })
  .trim()
  .min(1, "Informe seu e-mail.")
  .max(254, "O e-mail deve ter no máximo 254 caracteres.")
  .email("Informe um e-mail válido.");

const newPasswordSchema = z
  .string({ error: "Informe uma senha." })
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.");

const passwordConfirmationSchema = z
  .string({ error: "Confirme sua senha." })
  .min(1, "Confirme sua senha.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "Informe sua senha." })
    .min(1, "Informe sua senha.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

export const signupSchema = z
  .object({
    fullName: z
      .string({ error: "Informe seu nome." })
      .trim()
      .min(2, "O nome deve ter pelo menos 2 caracteres.")
      .max(120, "O nome deve ter no máximo 120 caracteres."),
    email: emailSchema,
    password: newPasswordSchema,
    passwordConfirmation: passwordConfirmationSchema,
  })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    {
      message: "As senhas não coincidem.",
      path: ["passwordConfirmation"],
    },
  );

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordUpdateSchema = z
  .object({
    password: newPasswordSchema,
    passwordConfirmation: passwordConfirmationSchema,
  })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    {
      message: "As senhas não coincidem.",
      path: ["passwordConfirmation"],
    },
  );

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
