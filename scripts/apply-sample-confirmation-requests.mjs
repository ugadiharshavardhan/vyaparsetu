// Installs the sample_requests table (seller → buyer sample confirmation flow).
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadEnv();
const sql = fs.readFileSync(
  path.resolve("supabase/migrations/20260718030000_sample_confirmation_requests.sql"),
  "utf8",
);

const client = new pg.Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.juoufayfyzpmscxeiydd",
  password: env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
const check = await client.query(`
  SELECT policyname FROM pg_policies WHERE tablename = 'sample_requests' ORDER BY policyname;
`);
console.log("sample_requests policies:", check.rows.map((r) => r.policyname));
await client.end();
