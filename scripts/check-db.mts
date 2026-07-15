import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const password = process.env.SUPABASE_DB_PASSWORD || "nVU.-JV-DC!d%L2";

const client = new pg.Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.juoufayfyzpmscxeiydd",
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();

  // 1. Check if description column exists in products table
  const schemaRes = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'products' AND table_schema = 'public' AND column_name = 'description'
  `);

  console.log("Column check:", schemaRes.rows);

  // 2. Count total products and products without descriptions
  const countTotal = await client.query("SELECT COUNT(*) FROM public.products");
  const countEmpty = await client.query("SELECT COUNT(*) FROM public.products WHERE description IS NULL OR description = ''");

  console.log("Total products:", countTotal.rows[0].count);
  console.log("Products without descriptions:", countEmpty.rows[0].count);

  // 3. Fetch a sample product
  const sample = await client.query("SELECT id, name, category_slug, brand, wholesale_price, unit, moq, gst_rate, description FROM public.products LIMIT 5");
  console.log("Sample products:", JSON.stringify(sample.rows, null, 2));

  await client.end();
}

main().catch(async (e) => {
  console.error("Error:", e);
  try {
    await client.end();
  } catch { }
  process.exit(1);
});
