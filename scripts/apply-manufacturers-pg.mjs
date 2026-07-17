import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!(m[1] in process.env)) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260717000000_manufacturers_table.sql"),
  "utf8",
);

// Direct db.<ref> host is IPv6-only here; use the IPv4 transaction pooler.
const client = new pg.Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.juoufayfyzpmscxeiydd",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
const r = await client.query("select count(*)::int as n from public.manufacturers");
console.log(`manufacturers table ready. rows: ${r.rows[0].n}`);
await client.end();
