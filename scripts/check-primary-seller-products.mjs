import pg from "pg";
import { readFileSync } from "fs";

const raw = readFileSync(".env", "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  let v = line.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  env[line.slice(0, i).trim()] = v;
}

const client = new pg.Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.juoufayfyzpmscxeiydd",
  password: env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const sellers = await client.query(`
  select id, email, business_name, verification_status::text as status
  from public.sellers
  order by created_at
`);
console.log("sellers:", sellers.rows);

const primary = await client.query(`
  select id, email, verification_status::text as status, business_name
  from public.sellers
  where lower(email) = 'ugadiharshavardhan@gmail.com'
`);
console.log("primary:", primary.rows);

const byOwner = await client.query(`
  select coalesce(s.email, 'NO_SELLER') as email,
         coalesce(s.verification_status::text, 'n/a') as status,
         count(p.id)::int as products
  from public.products p
  left join public.sellers s on s.id = p.seller_id
  group by 1, 2
  order by products desc
`);
console.log("products by owner:", byOwner.rows);

const sample = await client.query(`
  select p.id, p.name, p.seller_id, p.supplier->>'id' as supplier_json_id,
         p.supplier->>'name' as supplier_name, p.in_stock
  from public.products p
  where p.seller_id = (select id from public.sellers where lower(email)='ugadiharshavardhan@gmail.com')
  limit 5
`);
console.log("sample primary products:", sample.rows);

const fk = await client.query(`
  select conname from pg_constraint
  where conrelid = 'public.products'::regclass and contype = 'f'
`);
console.log("product FKs:", fk.rows);

await client.end();
