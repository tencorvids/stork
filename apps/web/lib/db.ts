import { createDatabaseClient } from "@stork/db";
import env from "./env";

export const db = createDatabaseClient(env.WEB_DATABASE_URL);
