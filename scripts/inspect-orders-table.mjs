import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

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

const env = loadEnv();
const password = env.SUPABASE_DB_PASSWORD;
const projectRef = env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID || "juoufayfyzpmscxeiydd";

async function pgInspect() {
  const client = new pg.Client({
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
    user: `postgres.${projectRef}`,
    password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    
    // Check columns of public.orders
    const ordersCols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    console.log("COLUMNS IN orders:");
    console.log(ordersCols.rows);

    // Check foreign keys on orders
    const fkeys = await client.query(`
      SELECT
        tc.constraint_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'orders';
    `);
    console.log("\nFOREIGN KEYS ON orders:");
    console.log(fkeys.rows);

  } catch (err) {
    console.error("Error inspecting orders schema:", err);
  } finally {
    await client.end();
  }
}

pgInspect();
