import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date(Date.now()))
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
};
