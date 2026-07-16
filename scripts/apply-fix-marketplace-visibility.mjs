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
const sql = fs.readFileSync(
  path.resolve("scratch/APPLY_FIX_MARKETPLACE_VISIBILITY.sql"),
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

const byOwner = await client.query(`
  select coalesce(s.email, 'NO_SELLER') as email,
         count(p.id)::int as products
  from public.products p
  left join public.sellers s on s.id = p.seller_id
  group by 1
`);
console.log("ownership:", byOwner.rows);

const grants = await client.query(`
  select grantee, privilege_type
  from information_schema.routine_privileges
  where routine_schema = 'public' and routine_name = 'is_admin'
`);
console.log("is_admin grants:", grants.rows);

await client.end();
console.log("Applied marketplace visibility fix.");
