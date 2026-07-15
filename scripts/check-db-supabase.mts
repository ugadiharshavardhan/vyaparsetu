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
  console.log("Connecting to Supabase at", url);
  
  const { data, count, error } = await supabase
    .from("products")
    .select("id, name, description", { count: "exact" });
    
  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }
  
  console.log("Successfully connected!");
  console.log("Total products count:", count);
  console.log("Rows returned:", data?.length);
  
  const emptyDesc = data?.filter(p => !p.description || p.description.trim() === "");
  console.log("Products without descriptions:", emptyDesc?.length);
  
  if (data && data.length > 0) {
    console.log("Sample product row:", data[0]);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
