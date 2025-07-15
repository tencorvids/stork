import z from "zod/v4";

export const requestSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string(),
});
export type Request = z.infer<typeof requestSchema>;
