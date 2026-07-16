import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function loadEnv() {
  const envPath = path.resolve(".env");
  const raw = fs.readFileSync(envPath, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadEnv();
const sqlPath = path.resolve("supabase/migrations/20260717000000_fix_orders_rls_recursion.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.juoufayfyzpmscxeiydd",
  password: env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("Connecting to PostgreSQL...");
  await client.connect();
  console.log("Executing SQL migration...");
  await client.query(sql);
  console.log("RLS infinite recursion fix successfully applied!");
} catch (e) {
  console.error("Migration failed:", e);
} finally {
  await client.end();
}
