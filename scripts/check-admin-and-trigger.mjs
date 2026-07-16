import pg from "pg";
import { readFileSync } from "fs";

const raw = readFileSync(".env", "utf8");
const env = {};
for (const line of raw.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i < 0) continue;
  let v = line.slice(i + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  env[line.slice(0, i).trim()] = v;
}

const client = new pg.Client({
  host: "aws-0-ap-northeast-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.juoufayfyzpmscxeiydd",
  password: env.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const admins = await client.query(
  "select a.id, coalesce(s.email, b.email, a.id::text) as email from public.admins a left join public.sellers s on s.id = a.id left join public.buyers b on b.id = a.id",
);
console.log("admins:", admins.rows);

const fn = await client.query(`
  select pg_get_functiondef(p.oid) as def
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'handle_new_user'
`);
console.log("handle_new_user exists:", fn.rows.length > 0);
if (fn.rows[0]) console.log(fn.rows[0].def.slice(0, 800));

const triggers = await client.query(`
  select t.tgname, pg_get_triggerdef(t.oid) as def
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'auth' and c.relname = 'users' and not t.tgisinternal
`);
console.log("triggers:", triggers.rows);

await client.end();
