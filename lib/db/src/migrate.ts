import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, pool } from "./index";

const migrationsFolder = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

migrate(db, { migrationsFolder })
  .then(() => {
    console.log("Migrations completed successfully.");
    return pool.end();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
