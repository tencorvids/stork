import { NextRequest } from "next/server";
import { tc } from "@stork/util";
import { responseError, responseSuccess } from "~/lib/api/response";
import { db } from "@/db";
import { userTable } from "@stork/db";
import { eq } from "drizzle-orm";
import { verifyPasswordHash } from "@/auth/hash";
import {
  createSession,
  generateSessionToken,
  validateSessionToken,
} from "@/auth/session";
import { setSessionTokenCookie } from "@/auth/cookie";
import { requestSchema, responseSchema } from "./types";

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
  const [result, error] = await tc(
    db.select().from(userTable).where(eq(userTable.email, input.email)),
  );

  if (error) {
    console.error(error);
    return responseError(
      "INTERNAL_SERVER_ERROR",
      "Failed to check for existing user.",
    );
  }

  const user = result[0];
  if (!user) {
    console.error("User not found.");
    return responseError("UNAUTHORIZED", "Invalid email or password.");
  }

  const validPassword = await verifyPasswordHash(user.password, input.password);
  if (validPassword.isErr() || !validPassword.value) {
    console.error("Invalid password.");
    return responseError("UNAUTHORIZED", "Invalid email or password.");
  }

  const [_, sessionUpdateError] = await tc(
    db
      .update(userTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(userTable.id, user.id)),
  );
  if (sessionUpdateError) {
    console.error(sessionUpdateError);
    return responseError(
      "INTERNAL_SERVER_ERROR",
      "Failed to update user last login time.",
    );
  }

  const token = generateSessionToken();
  const sessionResult = await createSession(token, user.id);
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

  const responseValueResponse = responseSchema.safeParse(
    sessionValidationResult.value,
  );
  if (!responseValueResponse.success) {
    console.error(responseValueResponse.error);
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create response.");
  }

  const response = responseSuccess(responseValueResponse.data);
  await setSessionTokenCookie(token, sessionResult.value.expiresAt);
  return response;
}
