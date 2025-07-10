import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import {
  SessionInsert,
  SessionSelect,
  sessionTable,
  UserSelect,
  userTable,
} from "@stork/db";
import { eq } from "drizzle-orm";
import { err, ok, Result } from "neverthrow";
import { db } from "@/db";
import { tc } from "@stork/util";

export const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_EXTENSION_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15; // 15 days

export type SessionValidationResult =
  | { session: SessionSelect; user: UserSelect }
  | { session: null; user: null };

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
): Promise<Result<SessionSelect, Error>> {
  const session: SessionInsert = {
    session: token,
    userId: userId,
    expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS),
  };

  const [result, error] = await tc(
    db.insert(sessionTable).values(session).returning(),
  );

  if (error) {
    return err(error);
  }

  const createdSession = result[0];
  return ok(createdSession);
}

export async function validateSessionToken(
  token: string,
): Promise<Result<SessionValidationResult, Error>> {
  try {
    const [result] = await db
      .select({ user: userTable, session: sessionTable })
      .from(sessionTable)
      .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
      .where(eq(sessionTable.session, token));

    if (!result) {
      throw new Error("session not found");
    }

    const { user, session } = result;
    if (Date.now() >= session.expiresAt.getTime()) {
      throw new Error("session expired");
    }

    if (
      Date.now() >=
      session.expiresAt.getTime() - SESSION_EXTENSION_THRESHOLD_MS
    ) {
      session.expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);
      await db
        .update(sessionTable)
        .set({ expiresAt: session.expiresAt })
        .where(eq(sessionTable.id, session.id));
      return ok({ session, user });
    }
  } catch (error) {
    console.error(error);
  }

  return ok({ session: null, user: null });
}

export async function invalidateSessionId(
  sessionId: string,
): Promise<Result<void, Error>> {
  try {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
  } catch (error) {
    console.error(error);
    return err(new Error("failed to invalidate session"));
  }

  return ok();
}
