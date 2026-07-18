import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = "ugadiharshavardhan@gmail.com";
const { data: users } = await sb.auth.admin.listUsers({ perPage: 1000 });
const user = users.users.find((u) => (u.email || "").toLowerCase() === email);
if (!user) {
  console.log("no auth user for", email);
  process.exit(0);
}
console.log("user id:", user.id);

for (const table of ["buyers", "sellers", "admins"]) {
  const { data } = await sb.from(table).select("id").eq("id", user.id).maybeSingle();
  console.log(`${table}:`, data ? "YES" : "no");
}
