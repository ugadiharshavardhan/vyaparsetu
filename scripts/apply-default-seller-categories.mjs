// Install the assign_default_seller_categories() function in the remote DB and
// (optionally) backfill an existing seller so they own the default catalog
// categories: flour-atta, cooking-oils, salt-sugar, snacks-bakery.
//
// Usage:
//   node scripts/apply-default-seller-categories.mjs                 # install only
//   node scripts/apply-default-seller-categories.mjs --email x@y.com # install + assign to that seller
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

function argValue(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

const env = loadEnv();
const email = argValue("--email");
const slugs = ["flour-atta", "cooking-oils", "salt-sugar", "snacks-bakery"];

const migration = fs.readFileSync(
  path.resolve("supabase/migrations/20260718000000_assign_default_seller_categories.sql"),
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

await client.query(migration);
console.log("installed function assign_default_seller_categories()");

const counts = await client.query(
  `select category_slug, count(*)::int as products
   from public.products
   where category_slug = any($1)
   group by category_slug
   order by category_slug`,
  [slugs],
);
console.log("default-category product counts:", counts.rows);

if (email) {
  const seller = await client.query(
    "select id, coalesce(business_name, full_name, email) as name from public.sellers where lower(email) = lower($1)",
    [email],
  );
  if (!seller.rows.length) {
    console.error(`No seller found for ${email}`);
  } else {
    const sellerId = seller.rows[0].id;
    const moved = await client.query("select public.assign_default_seller_categories($1) as moved", [
      sellerId,
    ]);
    console.log(`assigned ${moved.rows[0].moved} products to ${email} (${seller.rows[0].name})`);

    const owned = await client.query(
      `select p.category_slug, count(*)::int as products
       from public.products p
       where p.seller_id = $1 and p.category_slug = any($2)
       group by p.category_slug
       order by p.category_slug`,
      [sellerId, slugs],
    );
    console.log("now owned by this seller:", owned.rows);
  }
}

await client.end();
