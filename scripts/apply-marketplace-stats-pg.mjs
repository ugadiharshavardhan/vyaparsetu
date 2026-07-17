import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split(/\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260716220000_marketplace_public_stats.sql"),
  "utf8",
);

const client = new pg.Client({
  host: "db.juoufayfyzpmscxeiydd.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
const r = await client.query("select public.marketplace_public_stats() as s");
console.log(JSON.stringify(r.rows[0].s, null, 2));
await client.end();
