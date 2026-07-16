/**
 * Apply a SQL migration via direct Postgres (IPv6-aware).
 * Usage: node scripts/apply-sql.mjs path/to/migration.sql
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns";
import { promisify } from "node:util";

const lookup = promisify(dns.lookup);
const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Usage: node scripts/apply-sql.mjs <sql-file>");
  process.exit(1);
}

const PROJECT_REF = "juoufayfyzpmscxeiydd";

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
if (!password) {
  console.error("Missing SUPABASE_DB_PASSWORD");
  process.exit(1);
}

const sql = readFileSync(resolve(process.cwd(), sqlPath), "utf8");

async function resolveHosts() {
  const hosts = [];
  const direct = `db.${PROJECT_REF}.supabase.co`;
  try {
    const v6 = await lookup(direct, { family: 6 });
    hosts.push({ host: v6.address, servername: direct, port: 5432, user: "postgres", label: `IPv6 ${v6.address}` });
  } catch (e) {
    console.warn("IPv6 lookup failed", e.message);
  }
  try {
    const v4 = await lookup(direct, { family: 4 });
    hosts.push({ host: v4.address, servername: direct, port: 5432, user: "postgres", label: `IPv4 ${v4.address}` });
  } catch {
    /* ignore */
  }
  for (const region of ["ap-south-1", "ap-southeast-1", "us-east-1"]) {
    for (const port of [5432, 6543]) {
      hosts.push({
        host: `aws-0-${region}.pooler.supabase.com`,
        port,
        user: `postgres.${PROJECT_REF}`,
        label: `pooler aws-0-${region}:${port}`,
      });
      hosts.push({
        host: `aws-1-${region}.pooler.supabase.com`,
        port,
        user: `postgres.${PROJECT_REF}`,
        label: `pooler aws-1-${region}:${port}`,
      });
    }
  }
  return hosts;
}

async function main() {
  const hosts = await resolveHosts();
  let client;
  let lastErr;
  for (const cfg of hosts) {
    try {
      console.log(`Trying ${cfg.label}...`);
      client = new pg.Client({
        host: cfg.host,
        port: cfg.port,
        database: "postgres",
        user: cfg.user,
        password,
        ssl: { rejectUnauthorized: false, servername: cfg.servername ?? cfg.host },
        connectionTimeoutMillis: 12000,
      });
      await client.connect();
      console.log("Connected via", cfg.label);
      break;
    } catch (err) {
      lastErr = err;
      console.warn(String(err.message || err));
      await client?.end().catch(() => {});
      client = undefined;
    }
  }
  if (!client) {
    console.error("Could not connect.", lastErr);
    process.exit(1);
  }

  try {
    console.log(`Running ${sqlPath}...`);
    await client.query(sql);
    const check = await client.query(`
      SELECT
        (SELECT count(*)::int FROM public.categories) AS categories,
        (SELECT count(*)::int FROM public.subcategories) AS subcategories,
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'sub_categories'
        ) AS has_json_column
    `);
    console.log("Result:", check.rows[0]);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
