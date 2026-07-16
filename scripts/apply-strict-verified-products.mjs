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
const sql = fs.readFileSync(path.resolve("scratch/APPLY_STRICT_VERIFIED_PRODUCTS.sql"), "utf8");

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

const mix = await client.query(`
  select coalesce(s.verification_status::text, 'NO_SELLER') as status,
         count(p.id)::int as products
  from public.products p
  left join public.sellers s on s.id = p.seller_id
  group by 1
  order by 1
`);
console.log("products by seller status:", mix.rows);

const pol = await client.query(`
  select pg_get_expr(polqual, polrelid) as using_expr
  from pg_policy
  where polrelid = 'public.products'::regclass and polname = 'products public read'
`);
console.log("public read policy:", pol.rows[0]?.using_expr);

await client.end();
