import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(".env"), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = "ugadiharshavardhan@gmail.com";
const ADMIN_PASSWORD = "123456";

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  const normalized = email.toLowerCase();
  const res = await fetch(
    `${url.replace(/\/$/, "")}/auth/v1/admin/users?email=${encodeURIComponent(normalized)}`,
    { headers: { Authorization: `Bearer ${key}`, apikey: key } },
  );
  if (res.ok) {
    const payload = await res.json();
    const found = (payload.users ?? []).find((u) => (u.email ?? "").toLowerCase() === normalized);
    if (found) return found;
  }
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = (data.users ?? []).find((u) => (u.email ?? "").toLowerCase() === normalized);
    if (found) return found;
    if ((data.users ?? []).length < 200) break;
  }
  return null;
}

const user = await findUserByEmail(ADMIN_EMAIL);
if (!user) {
  console.error("Admin auth user not found:", ADMIN_EMAIL);
  process.exit(1);
}

const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
  password: ADMIN_PASSWORD,
  email_confirm: true,
});
if (updErr) {
  console.error("Failed to set password:", updErr.message);
  process.exit(1);
}

const { error: adminErr } = await supabase.from("admins").upsert({ id: user.id }, { onConflict: "id" });
if (adminErr) {
  console.error("Failed to ensure admins row:", adminErr.message);
  process.exit(1);
}

console.log("Admin ready:");
console.log("  email:", ADMIN_EMAIL);
console.log("  password:", ADMIN_PASSWORD);
console.log("  userId:", user.id);
console.log("Open /admin → dedicated admin sign-in → use these credentials.");
