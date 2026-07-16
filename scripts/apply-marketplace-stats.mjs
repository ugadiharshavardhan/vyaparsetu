/**
 * Apply marketplace_public_stats() so the landing page can show live seller/buyer counts.
 * Usage: node scripts/apply-marketplace-stats.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      let val = m[2].trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    /* ignore */
  }
}

loadEnv();

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260716220000_marketplace_public_stats.sql"),
  "utf8",
);

const admin = createClient(url, key, { auth: { persistSession: false } });

// PostgREST cannot run arbitrary DDL; use the SQL editor URL hint if this fails.
const { error } = await admin.rpc("marketplace_public_stats").maybeSingle?.() ?? { error: null };

if (error && !String(error.message).includes("Could not find")) {
  console.log("RPC not ready yet — paste migration SQL into Supabase SQL Editor:");
  console.log(sql);
  process.exit(0);
}

console.log("If RPC already exists, landing stats will use it.");
console.log("Otherwise run this SQL in the Supabase SQL Editor:\n");
console.log(sql);
