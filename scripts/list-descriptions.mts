import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const index = trimmed.indexOf("=");
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          let val = trimmed.substring(index + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      });
    }
  } catch (err) {
    console.error("Failed to load .env", err);
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category_slug, brand, wholesale_price, unit, moq, gst_rate");
    
  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }
  
  console.log(`Fetched ${data.length} products:`);
  
  data.forEach((p, index) => {
    console.log(`[${index + 1}] ID: ${p.id} | Name: "${p.name}" | Description: ${JSON.stringify(p.description)}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
