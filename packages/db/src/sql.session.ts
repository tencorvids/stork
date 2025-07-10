import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod/v4";
import { userTable } from "./sql.user";
import { timestamps } from "./column";

export const sessionTable = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => userTable.id, {
    onDelete: "cascade",
  }),
  session: text("session"),
  expiresAt: timestamp("expires_at").notNull(),
  ...timestamps,
});

// === Types === //

export const sessionSelectSchema = createSelectSchema(sessionTable);
export const sessionInsertSchema = createInsertSchema(sessionTable);
export const sessionUpdateSchema = createUpdateSchema(sessionTable);
export type SessionSelect = z.infer<typeof sessionSelectSchema>;
export type SessionInsert = z.infer<typeof sessionInsertSchema>;
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>;
