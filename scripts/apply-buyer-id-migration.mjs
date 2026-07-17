import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
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
const projectRef = env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID || "juoufayfyzpmscxeiydd";

const hosts = [
  {
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: 6543,
    user: `postgres.${projectRef}`,
    label: "pooler ap-northeast-1:6543",
  },
  {
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: 5432,
    user: `postgres.${projectRef}`,
    label: "pooler ap-northeast-1:5432",
  },
];

const sqlPath = "supabase/migrations/20260717034500_order_items_buyer_id.sql";
const sql = readFileSync(resolve(process.cwd(), sqlPath), "utf8");

async function main() {
  let client;
  let lastErr;
  for (const cfg of hosts) {
    try {
      console.log(`Connecting to ${cfg.label}...`);
      client = new pg.Client({
        host: cfg.host,
        port: cfg.port,
        database: "postgres",
        user: cfg.user,
        password,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await client.connect();
      console.log(`Connected via ${cfg.label}.`);
      break;
    } catch (err) {
      lastErr = err;
      console.warn(`Failed: ${err.message}`);
      client = undefined;
    }
  }

  if (!client) {
    console.error("Could not connect to Postgres.", lastErr);
    process.exit(1);
  }

  try {
    console.log(`Applying ${sqlPath}...`);
    await client.query("BEGIN;");
    await client.query(sql);
    await client.query("COMMIT;");
    console.log("SUCCESS: Applied order_items.buyed_id migration!");

    // Verification check
    const verify = await client.query(`
      SELECT COUNT(*)::int AS total_items, 
             COUNT(buyed_id)::int AS items_with_buyer
      FROM public.order_items;
    `);
    console.log("Verification results:", verify.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK;").catch(() => {});
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
