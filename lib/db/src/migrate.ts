import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const migrationFolderCandidates = [
  process.env.MIGRATIONS_FOLDER,
  path.resolve(process.cwd(), "../../lib/db/drizzle"),
  path.resolve(process.cwd(), "lib/db/drizzle"),
  path.resolve(runtimeDir, "../drizzle"),
].filter((candidate): candidate is string => Boolean(candidate));

const migrationsFolder = migrationFolderCandidates.find((candidate) =>
  fs.existsSync(candidate),
);

if (!migrationsFolder) {
  throw new Error(
    `No Drizzle migrations folder found. Checked: ${migrationFolderCandidates.join(", ")}`,
  );
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

try {
  console.log(`Applying migrations from: ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied successfully.");
} finally {
  await pool.end();
}
