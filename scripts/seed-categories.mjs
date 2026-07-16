/**
 * Seed marketplace categories via Supabase REST (works without direct Postgres).
 * Prefers relational `subcategories` table; falls back to legacy JSON column.
 *
 * Usage: node scripts/seed-categories.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
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

const TAXONOMY = [
  {
    id: "c-food-grains-cereals",
    slug: "food-grains-cereals",
    name: "Food Grains & Cereals",
    icon: "Wheat",
    description: "Rice, millets and cereal grains for wholesale restock.",
    subs: [
      ["rice", "Rice"],
      ["ragi", "Ragi"],
      ["jowar", "Jowar"],
      ["bajra", "Bajra"],
      ["barley", "Barley"],
      ["millets", "Millets"],
    ],
  },
  {
    id: "c-pulses-dal",
    slug: "pulses-dal",
    name: "Pulses (Dal)",
    icon: "Leaf",
    description: "Toor, moong, urad and other dals for kirana & HORECA.",
    subs: [
      ["toor-dal", "Toor Dal"],
      ["moong-dal", "Moong Dal"],
      ["urad-dal", "Urad Dal"],
      ["chana-dal", "Chana Dal"],
      ["masoor-dal", "Masoor Dal"],
      ["rajma", "Rajma"],
      ["green-gram", "Green Gram"],
    ],
  },
  {
    id: "c-flour-atta",
    slug: "flour-atta",
    name: "Flour & Atta",
    icon: "Cookie",
    description: "Wheat atta, maida, besan and specialty flours.",
    subs: [
      ["wheat-flour-atta", "Wheat Flour (Atta)"],
      ["maida", "Maida"],
      ["ragi-flour", "Ragi Flour"],
      ["besan", "Besan"],
      ["rice-flour", "Rice Flour"],
      ["corn-flour", "Corn Flour"],
      ["multigrain-flour", "Multigrain Flour"],
      ["sooji-semolina", "Sooji (Semolina)"],
    ],
  },
  {
    id: "c-rice-products",
    slug: "rice-products",
    name: "Rice Products",
    icon: "Soup",
    description: "Basmati, sona masoori, poha and brown rice.",
    subs: [
      ["basmati-rice", "Basmati Rice"],
      ["sona-masoori", "Sona Masoori"],
      ["poha", "Poha"],
      ["brown-rice", "Brown Rice"],
    ],
  },
  {
    id: "c-spices",
    slug: "spices",
    name: "Spices",
    icon: "Flame",
    description: "Powders, whole spices and masala blends.",
    subs: [
      ["turmeric-powder", "Turmeric Powder"],
      ["red-chilli-powder", "Red Chilli Powder"],
      ["coriander-powder", "Coriander Powder"],
      ["cumin", "Cumin"],
      ["pepper", "Pepper"],
      ["garam-masala", "Garam Masala"],
      ["cardamom", "Cardamom"],
      ["cloves", "Cloves"],
      ["cinnamon", "Cinnamon"],
      ["mustard-seeds", "Mustard Seeds"],
    ],
  },
  {
    id: "c-salt-sugar",
    slug: "salt-sugar",
    name: "Salt & Sugar",
    icon: "Droplets",
    description: "Salt, sugar and jaggery staples.",
    subs: [
      ["rock-salt", "Rock Salt"],
      ["iodized-salt", "Iodized Salt"],
      ["sugar", "Sugar"],
      ["jaggery", "Jaggery"],
      ["jaggery-powder", "Jaggery Powder"],
    ],
  },
  {
    id: "c-cooking-oils",
    slug: "cooking-oils",
    name: "Cooking Oils",
    icon: "Droplet",
    description: "Sunflower, mustard, coconut and other cooking oils.",
    subs: [
      ["sunflower-oil", "Sunflower Oil"],
      ["groundnut-oil", "Groundnut Oil"],
      ["mustard-oil", "Mustard Oil"],
      ["coconut-oil", "Coconut Oil"],
      ["sesame-oil", "Sesame Oil"],
      ["palm-oil", "Palm Oil"],
      ["rice-bran-oil", "Rice Bran Oil"],
    ],
  },
  {
    id: "c-snacks-bakery",
    slug: "snacks-bakery",
    name: "Snacks & Bakery",
    icon: "Cookie",
    description: "Biscuits, bread, namkeen and bakery items.",
    subs: [
      ["biscuits", "Biscuits"],
      ["cookies", "Cookies"],
      ["rusks", "Rusks"],
      ["bread", "Bread"],
      ["cakes", "Cakes"],
      ["namkeen", "Namkeen"],
      ["chips", "Chips"],
    ],
  },
  {
    id: "c-tea-coffee",
    slug: "tea-coffee",
    name: "Tea & Coffee",
    icon: "Coffee",
    description: "Tea, coffee and instant beverage powders.",
    subs: [
      ["tea-powder", "Tea Powder"],
      ["coffee-powder", "Coffee Powder"],
      ["green-tea", "Green Tea"],
      ["instant-coffee", "Instant Coffee"],
    ],
  },
  {
    id: "c-dry-fruits-nuts",
    slug: "dry-fruits-nuts",
    name: "Dry Fruits & Nuts",
    icon: "Nut",
    description: "Almonds, cashews, raisins and mixed nuts.",
    subs: [
      ["almonds", "Almonds"],
      ["cashews", "Cashews"],
      ["raisins", "Raisins"],
      ["pistachios", "Pistachios"],
      ["walnuts", "Walnuts"],
      ["peanuts", "Peanuts"],
    ],
  },
  {
    id: "c-packaged-foods",
    slug: "packaged-foods",
    name: "Packaged Foods",
    icon: "ShoppingBasket",
    description: "Noodles, pasta, pickles, papad and sauces.",
    subs: [
      ["instant-noodles", "Instant Noodles"],
      ["vermicelli", "Vermicelli"],
      ["pasta", "Pasta"],
      ["pickles", "Pickles"],
      ["papad", "Papad"],
      ["sauces", "Sauces"],
      ["ketchup", "Ketchup"],
    ],
  },
  {
    id: "c-beverages",
    slug: "beverages",
    name: "Beverages",
    icon: "CupSoda",
    description: "Juices, soft drinks, energy drinks and water.",
    subs: [
      ["fruit-juices", "Fruit Juices"],
      ["soft-drinks", "Soft Drinks"],
      ["energy-drinks", "Energy Drinks"],
      ["packaged-water", "Packaged Water"],
    ],
  },
  {
    id: "c-household-essentials",
    slug: "household-essentials",
    name: "Household Essentials",
    icon: "Sparkles",
    description: "Detergents, cleaners, soap and dish wash.",
    subs: [
      ["detergent-powder", "Detergent Powder"],
      ["dish-wash", "Dish Wash"],
      ["floor-cleaner", "Floor Cleaner"],
      ["toilet-cleaner", "Toilet Cleaner"],
      ["soap", "Soap"],
      ["hand-wash", "Hand Wash"],
    ],
  },
  {
    id: "c-personal-care",
    slug: "personal-care",
    name: "Personal Care",
    icon: "Heart",
    description: "Oral care, hair care and face wash essentials.",
    subs: [
      ["toothpaste", "Toothpaste"],
      ["toothbrush", "Toothbrush"],
      ["shampoo", "Shampoo"],
      ["hair-oil", "Hair Oil"],
      ["face-wash", "Face Wash"],
      ["talcum-powder", "Talcum Powder"],
    ],
  },
];

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function tableExists(name) {
  // Probe with a lightweight select; PostgREST returns PGRST205 / 404-ish when missing
  const { error } = await sb.from(name).select("*").limit(0);
  if (!error) return true;
  const msg = String(error.message || "");
  if (msg.includes("does not exist") || error.code === "PGRST205" || error.code === "42P01") {
    return false;
  }
  // Other errors (RLS etc.) still mean the table/view is known
  return true;
}

async function columnExistsViaInsertProbe() {
  const { error } = await sb.from("categories").insert({
    id: "__probe__",
    slug: "__probe__",
    name: "probe",
    sub_categories: [],
  });
  if (!error) {
    await sb.from("categories").delete().eq("id", "__probe__");
    return true;
  }
  const msg = String(error.message || "");
  if (msg.includes("sub_categories")) return false;
  // Unique violation / other = column accepted
  if (msg.includes("duplicate") || msg.includes("unique")) return true;
  return !msg.includes("Could not find");
}

async function main() {
  const hasSubsTable = await tableExists("subcategories");
  console.log("subcategories table:", hasSubsTable);

  // Clear existing taxonomy rows (products may FK-restrict — park first if needed)
  if (hasSubsTable) {
    await sb.from("subcategories").delete().neq("id", "");
  }

  const { data: existing } = await sb.from("categories").select("id,slug");
  console.log("existing categories:", existing?.length ?? 0);

  // Delete old categories (ignore errors from FK)
  for (const row of existing ?? []) {
    const { error } = await sb.from("categories").delete().eq("id", row.id);
    if (error) console.warn("delete category", row.slug, error.message);
  }

  const useJson = !hasSubsTable && (await columnExistsViaInsertProbe());
  console.log("using JSON sub_categories column:", useJson);

  for (const cat of TAXONOMY) {
    const payload = {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      icon: cat.icon,
      image: "",
      product_count: 0,
      description: cat.description,
    };
    if (useJson) {
      payload.sub_categories = cat.subs.map(([slug, name], i) => ({
        slug,
        name,
        sort_order: i + 1,
      }));
    }

    const { error } = await sb.from("categories").upsert(payload);
    if (error) {
      console.error("category upsert failed", cat.slug, error.message);
      continue;
    }

    if (hasSubsTable) {
      const rows = cat.subs.map(([slug, name], i) => ({
        id: `sc-${cat.slug}-${slug}`,
        category_id: cat.id,
        slug,
        name,
        sort_order: i + 1,
      }));
      const { error: subErr } = await sb.from("subcategories").upsert(rows);
      if (subErr) console.error("subcategories upsert failed", cat.slug, subErr.message);
    }
  }

  const { data: cats } = await sb.from("categories").select("id,slug,name");
  console.log(
    "seeded categories:",
    cats?.map((c) => c.slug),
  );

  if (hasSubsTable) {
    const { count } = await sb.from("subcategories").select("id", { count: "exact", head: true });
    console.log("seeded subcategories:", count);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
