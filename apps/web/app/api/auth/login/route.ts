import { NextRequest } from "next/server";
import { tc } from "@stork/util";
import { responseError, responseSuccess } from "@/response";
import { db } from "@/db";
import { userTable } from "@stork/db";
import { eq } from "drizzle-orm";
import z from "zod/v4";
import { verifyPasswordHash } from "@/auth/hash";
import { createSession, generateSessionToken } from "@/auth/session";
import { setSessionTokenCookie } from "@/auth/cookie";

const requestSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string(),
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
  const [result, error] = await tc(
    db.select().from(userTable).where(eq(userTable.email, input.email)),
  );
  if (error) {
    return responseError(
      "INTERNAL_SERVER_ERROR",
      "Failed to check for existing user.",
    );
  }

  const user = result[0];
  if (!user) {
    return responseError("UNAUTHORIZED", "Invalid email or password.");
  }

  const validPassword = await verifyPasswordHash(input.password, user.password);
  if (!validPassword) {
    return responseError("UNAUTHORIZED", "Invalid email or password.");
  }

  const [_, sessionUpdateError] = await tc(
    db
      .update(userTable)
      .set({ lastLoginAt: new Date() })
      .where(eq(userTable.id, user.id)),
  );
  if (sessionUpdateError) {
    return responseError(
      "INTERNAL_SERVER_ERROR",
      "Failed to update user last login time.",
    );
  }

  const token = generateSessionToken();
  const sessionResult = await createSession(token, user.id);
  if (sessionResult.isErr()) {
    return responseError("INTERNAL_SERVER_ERROR", "Failed to create session.");
  }

  const response = responseSuccess({});
  await setSessionTokenCookie(token, sessionResult.value.expiresAt);
  return response;
}
