// Applies pending database migrations during the build — but only when a
// database is configured, so the site still builds (on sample data) before
// one is connected.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL set — skipping migrations, site will use sample data.");
  process.exit(0);
}
const env = { ...process.env, DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL };
execSync("npx prisma migrate deploy", { stdio: "inherit", env });
