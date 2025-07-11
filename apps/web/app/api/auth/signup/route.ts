import { NextRequest } from "next/server";
import { tc } from "@stork/util";
import { UserInsert, userTable } from "@stork/db";
import { eq } from "drizzle-orm";
import z from "zod/v4";
import { db } from "@/db";
import { hashPassword } from "@/auth/hash";
import { createSession, generateSessionToken } from "@/auth/session";
import { setSessionTokenCookie } from "@/auth/cookie";
import { responseError, responseSuccess } from "@/response";

const requestSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export async function POST(request: NextRequest) {
  const [body, parseError] = await tc(request.json());
  if (parseError) {
    return responseError("BAD_REQUEST", "Invalid request body.");
  }

  const validationResult = requestSchema.safeParse(body);
  if (!validationResult.success) {
    return responseError("BAD_REQUEST", "Invalid request body.");
  }

  const input = validationResult.data;

  const [existingUserResult, existingUserError] = await tc(
    db.select().from(userTable).where(eq(userTable.email, input.email)),
  );
  if (existingUserError) {
    return responseError(
      "INTERNAL_SERVER_ERROR",
      "Failed to check for existing user.",
    );
  }

  const existingUser = existingUserResult[0];
  if (existingUser) {
    return responseError("CONFLICT", "User already exists.");
  }

  const hashedPassword = await hashPassword(input.password);
  if (hashedPassword.isErr()) {
    return responseError("INTERNAL_SERVER_ERROR", "Failed to hash password.");
  }
  const user: UserInsert = {
    email: input.email,
    password: hashedPassword.value,
    lastLoginAt: new Date(),
  };

  const [createdUserResult, createdUserError] = await tc(
    db.insert(userTable).values(user).returning(),
  );
  if (createdUserError) {
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create user.");
  }

  const createdUser = createdUserResult[0];
  if (!createdUser) {
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create user.");
  }

  const token = generateSessionToken();
  const sessionResult = await createSession(token, createdUser.id);
  if (sessionResult.isErr()) {
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create session.");
  }

  const response = responseSuccess({
    userId: createdUser.id,
    email: createdUser.email,
  });

  await setSessionTokenCookie(token, sessionResult.value.expiresAt);
  return response;
}
