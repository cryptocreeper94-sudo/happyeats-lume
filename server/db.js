// ═══════════════════════════════════════════════════════════
//  HAPPYEATS-LUME — Database Connection
//
//  Neon PostgreSQL via pg Pool + Drizzle ORM.
//  Same connection pattern as the original HappyEats —
//  connects to the same production database.
//
//  By DarkWave Studios LLC
// ═══════════════════════════════════════════════════════════

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

const isProduction = process.env.NODE_ENV === "production";

function buildConnectionString() {
  let connStr = process.env.DATABASE_URL;

  if (!connStr && process.env.PGHOST) {
    const host = process.env.PGHOST;
    const port = process.env.PGPORT || "5432";
    const database = process.env.PGDATABASE || "postgres";
    const user = process.env.PGUSER || "postgres";
    const pass = process.env.PGPASSWORD || "";
    connStr = `postgresql://${user}:${pass}@${host}:${port}/${database}`;
  }

  // Add SSL for Neon connections in production (skip for Render internal DB)
  if (connStr && isProduction && !connStr.includes("sslmode=") && !connStr.includes("dpg-")) {
    connStr += connStr.includes("?") ? "&sslmode=require" : "?sslmode=require";
  }

  return connStr;
}

const connectionString = buildConnectionString();

export const pool = new pg.Pool(
  connectionString
    ? {
        connectionString,
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: "localhost",
        port: 5432,
        database: "postgres",
        max: 1,
      }
);

// Log but don't crash on pool errors
pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

// Non-blocking connection test
if (connectionString) {
  pool.query("SELECT 1").then(
    () => console.log("Database connected successfully"),
    (err) => console.error("Database connection warning:", err.message)
  );
} else {
  console.warn("No DATABASE_URL configured — database queries will fail");
}

export const db = drizzle(pool, { schema });
export const client = pool;
