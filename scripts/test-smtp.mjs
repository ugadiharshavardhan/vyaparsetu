import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

function loadEnv() {
  const out = {};
  try {
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
  } catch {
    /* no .env */
  }
  return out;
}

const env = loadEnv();
const pass = (env.SMTP_PASS || "").replace(/\s+/g, "");
const t = nodemailer.createTransport({
  host: env.SMTP_HOST || "smtp.gmail.com",
  port: Number(env.SMTP_PORT || 465),
  secure: true,
  auth: { user: env.SMTP_USER, pass },
});

try {
  await t.verify();
  console.log("SMTP connection OK");
} catch (e) {
  console.error("SMTP FAIL:", e.message);
  process.exit(1);
}
