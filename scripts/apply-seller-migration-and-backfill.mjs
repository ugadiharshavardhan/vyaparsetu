/**
 * Apply seller ownership schema + assign all products to seller email.
 * Usage: node scripts/apply-seller-migration-and-backfill.mjs [email]
 */
import pg from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SELLER_EMAIL = (process.argv[2] ?? "ugadiharshavardhan@gmail.com").trim().toLowerCase();
const PROJECT_REF = "juoufayfyzpmscxeiydd";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const dbPassword = env.SUPABASE_DB_PASSWORD;
if (!dbPassword) {
  console.error("Missing SUPABASE_DB_PASSWORD in .env");
  process.exit(1);
}

const client = new pg.Client({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
});

async function runSqlFile(relativePath) {
  const sql = readFileSync(resolve(process.cwd(), relativePath), "utf8");
  console.log(`Applying ${relativePath}...`);
  await client.query(sql);
}

async function main() {
  await client.connect();
  console.log("Connected to Supabase Postgres");

  await runSqlFile("supabase/migrations/20260716010000_seller_products_and_order_seller.sql");
  await runSqlFile("supabase/migrations/20260716130000_assign_catalog_to_primary_seller.sql");

  const seller = await client.query(
    `SELECT id, email FROM public.sellers WHERE lower(trim(email)) = $1 LIMIT 1`,
    [SELLER_EMAIL],
  );
  const sellerId = seller.rows[0]?.id;
  if (!sellerId) throw new Error(`Seller row missing after backfill for ${SELLER_EMAIL}`);

  const count = await client.query(
    `SELECT count(*)::int AS n FROM public.products WHERE seller_id = $1`,
    [sellerId],
  );
  const linkCount = await client.query(
    `SELECT count(*)::int AS n FROM public.seller_products WHERE seller_id = $1`,
    [sellerId],
  );

  console.log(`Seller: ${SELLER_EMAIL}`);
  console.log(`Seller id: ${sellerId}`);
  console.log(`Products with seller_id: ${count.rows[0].n}`);
  console.log(`seller_products links: ${linkCount.rows[0].n}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
