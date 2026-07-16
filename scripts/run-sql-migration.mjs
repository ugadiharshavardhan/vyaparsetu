/**
 * Apply seller_products migration via Postgres (pooler or direct).
 * Usage: node scripts/run-sql-migration.mjs [relative-path-to-sql]
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sqlPath = process.argv[2] ?? "supabase/migrations/20260716010000_seller_products_and_order_seller.sql";
const PROJECT_REF = "juoufayfyzpmscxeiydd";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const password = env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD in .env");
  process.exit(1);
}

const hosts = [
  { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: "postgres" },
  { host: `aws-0-ap-south-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
  { host: `aws-0-ap-south-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}` },
  { host: `aws-1-ap-south-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
];

const sql = readFileSync(resolve(process.cwd(), sqlPath), "utf8");

async function tryConnect(cfg) {
  const client = new pg.Client({
    ...cfg,
    database: "postgres",
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  return client;
}

async function main() {
  let client;
  let lastErr;
  for (const cfg of hosts) {
    try {
      console.log(`Trying ${cfg.user}@${cfg.host}:${cfg.port}...`);
      client = await tryConnect(cfg);
      console.log("Connected.");
      break;
    } catch (err) {
      lastErr = err;
      console.warn(String(err.message || err));
    }
  }
  if (!client) {
    console.error("Could not connect to Postgres.", lastErr);
    process.exit(1);
  }

  try {
    console.log(`Running ${sqlPath}...`);
    await client.query(sql);
    const check = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'seller_products'
       ) AS ok`,
    );
    console.log("seller_products exists:", check.rows[0]?.ok);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
