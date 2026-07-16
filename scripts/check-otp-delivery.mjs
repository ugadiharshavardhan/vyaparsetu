import pg from "pg";
import { readFileSync } from "fs";
import nodemailer from "nodemailer";

function loadEnv() {
  const raw = readFileSync(".env", "utf8");
  const out = {};
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
    out[key] = val;
  }
  return out;
}

const env = loadEnv();

const client = new pg.Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.juoufayfyzpmscxeiydd",
  password: env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const recent = await client.query(`
  select email, purpose, attempts, created_at, expires_at, consumed_at
  from public.email_otps
  order by created_at desc
  limit 20
`);
console.log("recent OTPs (code not stored plaintext):");
for (const r of recent.rows) {
  console.log(
    `  ${r.created_at.toISOString()} | ${r.email} | ${r.purpose} | attempts=${r.attempts} | consumed=${r.consumed_at ? "yes" : "no"}`,
  );
}

const domains = await client.query(`
  select split_part(email, '@', 2) as domain, count(*)::int as n
  from public.email_otps
  group by 1
  order by n desc
`);
console.log("OTP domains:", domains.rows);

await client.end();

// SMTP connectivity check
const user = env.SMTP_USER;
const pass = String(env.SMTP_PASS || "").replace(/\s+/g, "");
const host = env.SMTP_HOST || "smtp.gmail.com";
const port = Number(env.SMTP_PORT || "465");
console.log("\nSMTP config:", { host, port, user, from: env.EMAIL_FROM, passLen: pass.length });

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log("SMTP verify: OK");
} catch (e) {
  console.error("SMTP verify FAILED:", e.message);
  process.exitCode = 1;
}
