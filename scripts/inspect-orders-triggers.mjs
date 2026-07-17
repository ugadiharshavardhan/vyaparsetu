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
    
    // Check triggers on orders table
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'orders';
    `);
    console.log("TRIGGERS ON orders:");
    console.log(triggers.rows);

  } catch (err) {
    console.error("Error inspecting orders triggers:", err);
  } finally {
    await client.end();
  }
}

pgInspect();
