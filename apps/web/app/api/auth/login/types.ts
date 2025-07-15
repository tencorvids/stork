import { sessionSelectSchema, userSelectSchema } from "@stork/db";
import z from "zod/v4";

// Request
export const requestSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string(),
});
export type Request = z.infer<typeof requestSchema>;

// Response
export const responseSchema = z.object({
  session: sessionSelectSchema.nullable(),
  user: userSelectSchema.omit({ password: true }).nullable(),
});
export type Response = z.infer<typeof responseSchema>;
