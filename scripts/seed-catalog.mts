/**
 * Bulk-seed categories + products from local UI seed data into Supabase.
 * Usage: npx tsx scripts/seed-catalog.mts
 */
import pg from "pg";
import { CATEGORIES } from "../src/data/categories.ts";
import { PRODUCTS } from "../src/data/products.ts";

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
  const started = Date.now();
  await client.connect();
  await client.query("begin");

  try {
    const catValues: unknown[] = [];
    const catPlaceholders: string[] = [];
    CATEGORIES.forEach((c, i) => {
      const o = i * 8;
      catPlaceholders.push(
        `($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6},$${o + 7},$${o + 8}::jsonb)`,
      );
      catValues.push(
        c.id,
        c.slug,
        c.name,
        c.icon,
        c.image,
        c.productCount,
        c.description,
        JSON.stringify(c.subCategories ?? []),
      );
    });

    await client.query(
      `INSERT INTO public.categories
        (id, slug, name, icon, image, product_count, description, sub_categories)
       VALUES ${catPlaceholders.join(",")}
       ON CONFLICT (id) DO UPDATE SET
         slug = EXCLUDED.slug,
         name = EXCLUDED.name,
         icon = EXCLUDED.icon,
         image = EXCLUDED.image,
         product_count = EXCLUDED.product_count,
         description = EXCLUDED.description,
         sub_categories = EXCLUDED.sub_categories,
         updated_at = now()`,
      catValues,
    );

    const chunkSize = 20;
    for (let i = 0; i < PRODUCTS.length; i += chunkSize) {
      const chunk = PRODUCTS.slice(i, i + chunkSize);
      const values: unknown[] = [];
      const placeholders: string[] = [];

      chunk.forEach((p, idx) => {
        const o = idx * 27;
        placeholders.push(
          `($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6},$${o + 7},$${o + 8},$${o + 9}::jsonb,$${o + 10},$${o + 11},$${o + 12},$${o + 13},$${o + 14},$${o + 15},$${o + 16}::jsonb,$${o + 17},$${o + 18},$${o + 19},$${o + 20},$${o + 21},$${o + 22},$${o + 23}::jsonb,$${o + 24}::jsonb,$${o + 25},$${o + 26},$${o + 27})`,
        );
        values.push(
          p.id,
          p.slug,
          p.name,
          p.brand,
          p.category,
          p.subCategory ?? null,
          p.sku ?? null,
          p.image,
          JSON.stringify(p.images ?? [p.image]),
          p.wholesalePrice,
          p.mrp,
          p.moq,
          p.unit,
          p.gstIncluded,
          p.gstRate,
          JSON.stringify(p.supplier),
          p.rating,
          p.reviewCount,
          p.inStock,
          p.stockCount,
          !!p.featured,
          p.description,
          JSON.stringify(p.specifications ?? {}),
          JSON.stringify(p.highlights ?? []),
          p.packagingDetails ?? null,
          p.deliveryDays ?? null,
          p.deliveryEstimate ?? null,
        );
      });

      await client.query(
        `INSERT INTO public.products (
          id, slug, name, brand, category_slug, sub_category, sku, image, images,
          wholesale_price, mrp, moq, unit, gst_included, gst_rate, supplier,
          rating, review_count, in_stock, stock_count, featured, description,
          specifications, highlights, packaging_details, delivery_days, delivery_estimate
        ) VALUES ${placeholders.join(",")}
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          brand = EXCLUDED.brand,
          category_slug = EXCLUDED.category_slug,
          sub_category = EXCLUDED.sub_category,
          sku = EXCLUDED.sku,
          image = EXCLUDED.image,
          images = EXCLUDED.images,
          wholesale_price = EXCLUDED.wholesale_price,
          mrp = EXCLUDED.mrp,
          moq = EXCLUDED.moq,
          unit = EXCLUDED.unit,
          gst_included = EXCLUDED.gst_included,
          gst_rate = EXCLUDED.gst_rate,
          supplier = EXCLUDED.supplier,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          in_stock = EXCLUDED.in_stock,
          stock_count = EXCLUDED.stock_count,
          featured = EXCLUDED.featured,
          description = EXCLUDED.description,
          specifications = EXCLUDED.specifications,
          highlights = EXCLUDED.highlights,
          packaging_details = EXCLUDED.packaging_details,
          delivery_days = EXCLUDED.delivery_days,
          delivery_estimate = EXCLUDED.delivery_estimate,
          updated_at = now()`,
        values,
      );
    }

    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  }

  const cats = await client.query("select count(*)::int as n from public.categories");
  const prods = await client.query("select count(*)::int as n from public.products");
  console.log(
    JSON.stringify({
      ok: true,
      categories: cats.rows[0].n,
      products: prods.rows[0].n,
      ms: Date.now() - started,
    }),
  );
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await client.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
