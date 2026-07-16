import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

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
  path.resolve("scratch/ASSIGN_CATEGORIES_TO_PENDING_SELLER.sql"),
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

const summary = await client.query(`
  select p.category_slug,
         s.email,
         s.verification_status::text as status,
         count(*)::int as products
  from public.products p
  join public.sellers s on s.id = p.seller_id
  where p.category_slug in ('salt-sugar', 'snacks-bakery', 'spices', 'tea-coffee')
  group by 1, 2, 3
  order by 1
`);
console.log("reassigned:", summary.rows);

const ownership = await client.query(`
  select coalesce(s.email, 'NO_SELLER') as email,
         s.verification_status::text as status,
         count(p.id)::int as products
  from public.products p
  left join public.sellers s on s.id = p.seller_id
  group by 1, 2
  order by products desc
`);
console.log("all ownership:", ownership.rows);

await client.end();

// Buyer/anon visibility check
const supabase = createClient(
  env.VITE_SUPABASE_URL || env.SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY,
);

const hidden = await supabase
  .from("products")
  .select("id", { count: "exact", head: true })
  .in("category_slug", ["salt-sugar", "snacks-bakery", "spices", "tea-coffee"]);

const visible = await supabase
  .from("products")
  .select("id", { count: "exact", head: true });

console.log("anon visible in those categories:", hidden.count);
console.log("anon total visible products:", visible.count);
