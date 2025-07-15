import { NextRequest } from "next/server";
import { tc } from "@stork/util";
import { UserInsert, userTable } from "@stork/db";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { hashPassword } from "@/auth/hash";
import {
  createSession,
  generateSessionToken,
  validateSessionToken,
} from "@/auth/session";
import { setSessionTokenCookie } from "@/auth/cookie";
import { responseError, responseSuccess } from "~/lib/api/response";
import { requestSchema } from "./type";

export async function POST(request: NextRequest) {
  const [body, parseError] = await tc(request.json());
  if (parseError) {
    console.error(parseError);
    return responseError("BAD_REQUEST", "Invalid request body.");
  }

  const validationResult = requestSchema.safeParse(body);
  if (!validationResult.success) {
    console.error(validationResult.error);
    return responseError("BAD_REQUEST", "Invalid request body.");
  }

  const input = validationResult.data;

  const [existingUserResult, existingUserError] = await tc(
    db.select().from(userTable).where(eq(userTable.email, input.email)),
  );
  if (existingUserError) {
    console.error(existingUserError);
    return responseError(
      "INTERNAL_SERVER_ERROR",
      "Failed to check for existing user.",
    );
  }

  const existingUser = existingUserResult[0];
  if (existingUser) {
    console.error("User already exists.");
    return responseError("CONFLICT", "User already exists.");
  }

  const hashedPassword = await hashPassword(input.password);
  if (hashedPassword.isErr()) {
    console.error(hashedPassword.error);
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
    console.error(createdUserError);
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create user.");
  }

  const createdUser = createdUserResult[0];
  if (!createdUser) {
    console.error("Failed to create user.");
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create user.");
  }

  const token = generateSessionToken();
  const sessionResult = await createSession(token, createdUser.id);
  if (sessionResult.isErr()) {
    console.error(sessionResult.error);
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create session.");
  }

  const sessionValidationResult = await validateSessionToken(token);
  if (sessionValidationResult.isErr()) {
    console.error(sessionValidationResult.error);
    return responseError(
      "INTERNAL_SERVER_ERROR",
      "Failed to validate session.",
    );
  }

  const response = responseSuccess(sessionValidationResult.value);

  await setSessionTokenCookie(token, sessionResult.value.expiresAt);
  return response;
}
