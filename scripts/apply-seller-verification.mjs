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
const sql = fs.readFileSync(path.resolve("scratch/APPLY_SELLER_VERIFICATION.sql"), "utf8");

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
    console.log(`Trying ${cfg.label}...`);
    await client.connect();
    console.log("Connected via", cfg.label);
    await client.query(sql);
    const { rows } = await client.query(
      `select verification_status::text as status, count(*)::int as n
       from public.sellers group by 1 order by 1`,
    );
    console.log("Migration applied. Seller verification counts:", rows);
    await client.end();
    process.exit(0);
  } catch (e) {
    lastErr = e;
    console.warn(cfg.label, "->", e.message);
    await client.end().catch(() => undefined);
  }
}

console.error("Failed to apply migration:", lastErr?.message || lastErr);
process.exit(1);
