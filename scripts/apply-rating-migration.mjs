import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function loadEnv() {
  const raw = fs.readFileSync(path.resolve(".env"), "utf8");
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
const password = env.SUPABASE_DB_PASSWORD;
const projectRef = env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID || "juoufayfyzpmscxeiydd";
const sql = fs.readFileSync(path.resolve("supabase/migrations/20260717024000_holistic_seller_rating_system.sql"), "utf8");

const targets = [
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
  {
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    label: "direct db host",
  },
];

let lastErr;
for (const cfg of targets) {
  const client = new pg.Client({
    host: cfg.host,
    port: cfg.port,
    database: "postgres",
    user: cfg.user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    console.log(`Connecting to ${cfg.label}...`);
    await client.connect();
    console.log("Connected. Applying rating migration sql...");
    await client.query("BEGIN;");
    await client.query(sql);
    await client.query("COMMIT;");
    console.log("SUCCESS: Applied holistic seller rating system SQL migration!");
    await client.end();
    process.exit(0);
  } catch (e) {
    console.warn(`Connection to ${cfg.label} failed: ${e.message}`);
    lastErr = e;
    try {
      await client.end();
    } catch {}
  }
}

console.error("FAILED to apply migration to all targets.");
if (lastErr) console.error(lastErr);
process.exit(1);
