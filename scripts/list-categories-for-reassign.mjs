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

const cats = await client.query(`
  select slug, name, product_count from public.categories order by name
`);
console.log("categories:", cats.rows);

const seller = await client.query(`
  select id, email, verification_status::text as status, business_name
  from public.sellers
  where lower(email) = 'madhusethusagar576@gmail.com'
`);
console.log("target seller:", seller.rows);

const byCat = await client.query(`
  select category_slug, count(*)::int as n
  from public.products
  group by 1
  order by 1
`);
console.log("products by category_slug:", byCat.rows);

await client.end();
