import { defineConfig } from "drizzle-kit";
import { z } from "zod/v4";

const envSchema = z.object({
  DB_DATABASE_URL: z.url(),
});
const env = envSchema.parse(process.env);

export default defineConfig({
  strict: true,
  verbose: true,
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_DATABASE_URL,
  },
  schema: "./src/sql.*.ts",
});
