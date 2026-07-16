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

const pol = await client.query(`
  select polname, pg_get_expr(polqual, polrelid) as using_expr
  from pg_policy
  where polrelid = 'public.products'::regclass
`);
console.log("policies:", JSON.stringify(pol.rows, null, 2));

const fn = await client.query(`
  select proname from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'is_verified_seller'
`);
console.log("is_verified_seller exists:", fn.rows.length > 0);

const sellers = await client.query(
  "select id, email, verification_status from public.sellers order by created_at",
);
console.log("sellers:", sellers.rows);

const mix = await client.query(`
  select coalesce(s.verification_status::text, 'NO_SELLER') as status,
         count(p.id)::int as products
  from public.products p
  left join public.sellers s on s.id = p.seller_id
  group by 1
  order by 1
`);
console.log("products by status:", mix.rows);

const unverified = await client.query(`
  select p.name, p.seller_id, s.email, s.verification_status::text as status
  from public.products p
  left join public.sellers s on s.id = p.seller_id
  where p.seller_id is null
     or s.verification_status is distinct from 'verified'
  limit 20
`);
console.log("visible-risk products:", unverified.rows);

await client.end();
