import { drizzle } from "drizzle-orm/postgres-js";

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export function createDatabaseClient(connectionString: string) {
  return drizzle({
    casing: "snake_case",
    connection: connectionString,
  });
}

export function asDatabaseClient(tx: unknown): DatabaseClient {
  return tx as DatabaseClient;
}
