import fs from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const projectRoot = "c:\\Users\\nanda\\Downloads\\vyaparsetu";
const require = createRequire(resolve(projectRoot, "node_modules") + "/");
const pg = require("pg");

function loadEnv() {
  const envPath = "c:\\Users\\nanda\\Downloads\\vyaparsetu\\.env";
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
const sqlPath = resolve(projectRoot, "supabase/migrations/20260717013200_fix_ambiguous_rls_variables.sql");
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
  console.log("RLS ambiguous variable reference fix successfully applied!");
} catch (e) {
  console.error("Migration failed:", e);
} finally {
  await client.end();
}
