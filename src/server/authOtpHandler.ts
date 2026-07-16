import { createHash, randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";
import { createClient, type User } from "@supabase/supabase-js";

type Purpose = "signup" | "reset";
type Role = "buyer" | "seller";

type RegisterProfile = {
  full_name?: string;
  business_name?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  gst_number?: string;
};

let envBootstrapped = false;

function bootstrapEnv() {
  if (envBootstrapped) return;
  envBootstrapped = true;
  try {
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i < 0) continue;
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    /* no local .env — rely on host secrets (Lovable / production) */
  }
}

function env(name: string, fallback = "") {
  bootstrapEnv();
  return (process.env[name] ?? fallback).trim();
}

async function invalidatePreviousOtps(email: string, purpose: Purpose) {
  const supabase = adminClient();
  await supabase
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() } as never)
    .eq("email", email)
    .eq("purpose", purpose)
    .is("consumed_at", null);
}

async function insertOtp(email: string, purpose: Purpose, codeHash: string, expiresAt: string) {
  const supabase = adminClient();
  await invalidatePreviousOtps(email, purpose);
  const { error } = await supabase.from("email_otps").insert({
    email,
    purpose,
    code_hash: codeHash,
    expires_at: expiresAt,
  } as never);
  if (error) throw new Error(`Could not store verification code: ${error.message}`);
}

async function fetchActiveOtp(email: string, purpose: Purpose) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as {
    id: string;
    code_hash: string;
    attempts: number;
    expires_at: string;
  } | null;
}

async function bumpOtpAttempts(id: string, attempts: number) {
  await adminClient().from("email_otps").update({ attempts: attempts + 1 } as never).eq("id", id);
}

async function consumeOtp(id: string) {
  await adminClient()
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() } as never)
    .eq("id", id);
}

async function recentOtpCooldown(email: string, purpose: Purpose, force: boolean) {
  const supabase = adminClient();
  const { data: recent } = await supabase
    .from("email_otps")
    .select("created_at")
    .eq("email", email)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!recent?.created_at) return null;
  const ageMs = Date.now() - new Date(recent.created_at).getTime();
  const cooldownMs = force ? 15_000 : 45_000;
  if (ageMs < cooldownMs) {
    return Math.ceil((cooldownMs - ageMs) / 1000);
  }
  return null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashOtp(code: string, email: string, purpose: Purpose) {
  const secret = env("OTP_HASH_SECRET");
  if (!secret) throw new Error("OTP_HASH_SECRET is not set in .env");
  return createHash("sha256")
    .update(`${normalizeEmail(email)}:${purpose}:${code}:${secret}`)
    .digest("hex");
}

function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function urlTrim() {
  return (env("SUPABASE_URL") || env("VITE_SUPABASE_URL")).replace(/\/$/, "");
}

function adminClient() {
  const url = env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url) throw new Error("SUPABASE_URL is not set");
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing in .env (Dashboard → Settings → API → service_role).",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function findAuthUserById(userId: string) {
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user;
}

/** Look up auth.users by email — does not require a buyers/sellers row. */
async function findAuthUserByEmail(email: string): Promise<User | null> {
  const supabase = adminClient();
  const normalized = normalizeEmail(email);

  // Fast path: membership tables
  const [buyer, seller] = await Promise.all([
    supabase.from("buyers").select("id").eq("email", normalized).maybeSingle(),
    supabase.from("sellers").select("id").eq("email", normalized).maybeSingle(),
  ]);
  const memberId = buyer.data?.id ?? seller.data?.id ?? null;
  if (memberId) {
    const byId = await findAuthUserById(memberId);
    if (byId) return byId;
  }

  // Admin API email filter (more reliable than paginating all users)
  const url = urlTrim();
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  try {
    const res = await fetch(
      `${url}/auth/v1/admin/users?email=${encodeURIComponent(normalized)}`,
      { headers: { Authorization: `Bearer ${key}`, apikey: key } },
    );
    if (res.ok) {
      const payload = (await res.json()) as { users?: User[] };
      const found = (payload.users ?? []).find((u) => (u.email ?? "").toLowerCase() === normalized);
      if (found) return found;
    }
  } catch {
    /* fall through to pagination */
  }

  for (let page = 1; page <= 25; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.warn("[auth-otp] listUsers", error.message);
      break;
    }
    const users = data?.users ?? [];
    const found = users.find((u) => (u.email ?? "").toLowerCase() === normalized);
    if (found) return found;
    if (users.length < 200) break;
  }
  return null;
}

async function sendSmtpEmail(to: string, subject: string, html: string, text: string) {
  const host = env("SMTP_HOST", "smtp.gmail.com");
  const port = Number(env("SMTP_PORT", "465"));
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS").replace(/\s+/g, "");
  const from = env("EMAIL_FROM") || user;

  if (!user || !pass) {
    throw new Error("SMTP_USER / SMTP_PASS missing in .env (use your Gmail app password)");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to, subject, html, text });
}

function otpEmail(purpose: Purpose, code: string) {
  const title =
    purpose === "signup" ? "Verify your VyaparSetu account" : "Reset your VyaparSetu password";
  const intro =
    purpose === "signup"
      ? "Use this 6-digit code to verify your email and activate your account."
      : "Use this 6-digit code to reset your password. If you did not request this, ignore this email.";
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px;color:#0f172a">${title}</h2>
      <p style="color:#475569;font-size:14px;line-height:1.5">${intro}</p>
      <div style="margin:24px 0;padding:16px 20px;background:#f1f5f9;border-radius:12px;text-align:center">
        <div style="letter-spacing:8px;font-size:32px;font-weight:700;color:#0f172a">${code}</div>
      </div>
      <p style="color:#64748b;font-size:12px">This code expires in 10 minutes.</p>
    </div>`;
  const text = `${title}\n\nYour code: ${code}\n\nExpires in 10 minutes.`;
  return { subject: title, html, text };
}

async function removeLegacyProfile(userId: string) {
  const supabase = adminClient();
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  if (error && !/profiles|schema cache|does not exist|Could not find/i.test(error.message)) {
    console.warn("[auth-otp] legacy profile cleanup", error.message);
  }
}

async function upsertMembership(userId: string, email: string, role: Role, profile: RegisterProfile) {
  const supabase = adminClient();
  const now = new Date().toISOString();

  if (role === "seller") {
    const payload = {
      id: userId,
      email,
      full_name: profile.full_name || null,
      owner_name: profile.full_name || null,
      business_name: profile.business_name || null,
      phone: profile.phone || null,
      gst_number: profile.gst_number || null,
      address: profile.address || null,
      business_type: "manufacturer",
      onboarding_completed: false,
      verification_status: "pending",
      updated_at: now,
    };
    let { error } = await supabase.from("sellers").upsert(payload as never, { onConflict: "id" });
    if (error) {
      ({ error } = await supabase.from("sellers").upsert(
        {
          id: userId,
          email,
          full_name: profile.full_name || null,
          business_name: profile.business_name || null,
          phone: profile.phone || null,
          gst_number: profile.gst_number || null,
          address: profile.address || null,
          updated_at: now,
        } as never,
        { onConflict: "id" },
      ));
    }
    if (error) throw new Error(`Could not create seller profile: ${error.message}`);
    await removeLegacyProfile(userId);
    return;
  }

  const { error } = await supabase.from("buyers").upsert(
    {
      id: userId,
      email,
      full_name: profile.full_name || null,
      business_name: profile.business_name || null,
      phone: profile.phone || null,
      whatsapp: profile.whatsapp || profile.phone || null,
      address: profile.address || null,
      updated_at: now,
    } as never,
    { onConflict: "id" },
  );
  if (error) throw new Error(`Could not create buyer profile: ${error.message}`);
  await removeLegacyProfile(userId);
}

async function hasMembership(userId: string, role: Role) {
  const supabase = adminClient();
  const table = role === "seller" ? "sellers" : "buyers";
  const { data } = await supabase.from(table).select("id").eq("id", userId).maybeSingle();
  return !!data;
}

async function handleSend(
  emailRaw: string,
  purpose: Purpose,
  userId?: string,
  options?: { force?: boolean },
) {
  const email = normalizeEmail(emailRaw);
  if (!email.includes("@")) return { status: 400, body: { error: "Valid email is required" } };
  if (purpose !== "signup" && purpose !== "reset") {
    return { status: 400, body: { error: "Invalid purpose" } };
  }

  let user = userId ? await findAuthUserById(userId) : null;
  if (!user) {
    user = await findAuthUserByEmail(email);
  }

  if (purpose === "reset" && !user) {
    // Do not leak whether the email exists
    return { status: 200, body: { ok: true, message: "If an account exists, a code was sent." } };
  }
  if (purpose === "signup" && !user) {
    return { status: 400, body: { error: "Create your account first, then verify the code." } };
  }

  const waitSec = await recentOtpCooldown(email, purpose, !!options?.force);
  if (waitSec != null) {
    return {
      status: 429,
      body: { error: `Please wait ${waitSec} seconds before requesting another code.` },
    };
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await insertOtp(email, purpose, hashOtp(code, email, purpose), expiresAt);

  const mail = otpEmail(purpose, code);
  await sendSmtpEmail(email, mail.subject, mail.html, mail.text);

  return { status: 200, body: { ok: true, message: "Verification code sent", expiresInSec: 600 } };
}

async function handleLoginHelp(emailRaw: string, role?: Role) {
  const email = normalizeEmail(emailRaw);
  if (!email.includes("@")) return { status: 400, body: { error: "Valid email is required" } };

  const user = await findAuthUserByEmail(email);
  if (!user) {
    return { status: 200, body: { exists: false } };
  }

  const confirmed = !!user.email_confirmed_at;
  let hasRole = true;
  if (role === "buyer" || role === "seller") {
    hasRole = await hasMembership(user.id, role);
  }

  return {
    status: 200,
    body: {
      exists: true,
      confirmed,
      hasRole,
      userId: user.id,
    },
  };
}

/**
 * Server-side register: creates or reclaims auth user + membership row, then emails OTP.
 * Fixes "email already exists" when auth.users has an orphan with no sellers/buyers row.
 */
async function handleRegister(input: {
  email?: string;
  password?: string;
  role?: Role;
  profile?: RegisterProfile;
}) {
  const email = normalizeEmail(input.email ?? "");
  const password = (input.password ?? "").trim();
  const role = input.role;
  const profile = input.profile ?? {};

  if (!email.includes("@")) return { status: 400, body: { error: "Valid email is required" } };
  if (password.length < 8) return { status: 400, body: { error: "Password must be at least 8 characters" } };
  if (role !== "buyer" && role !== "seller") {
    return { status: 400, body: { error: "Invalid account role" } };
  }

  const supabase = adminClient();
  const metadata = {
    full_name: profile.full_name ?? "",
    owner_name: profile.full_name ?? "",
    business_name: profile.business_name ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? profile.phone ?? "",
    address: profile.address ?? "",
    gst_number: profile.gst_number ?? "",
    account_type: role,
    business_role: role,
    business_type: role === "seller" ? "manufacturer" : "retailer",
  };

  let user = await findAuthUserByEmail(email);

  if (user) {
    const member = await hasMembership(user.id, role);
    const confirmed = !!user.email_confirmed_at;

    // Fully registered for this role → block
    if (member && confirmed) {
      return {
        status: 400,
        body: { error: "This email is already registered. Try signing in instead." },
      };
    }

    // Orphan / unverified / missing role row → reclaim with new password + metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: false,
      user_metadata: metadata,
    });
    if (updateError) {
      return { status: 500, body: { error: updateError.message || "Could not update account" } };
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: metadata,
    });

    if (error || !data.user) {
      // Possible race: created between lookup and create
      user = await findAuthUserByEmail(email);
      if (!user) {
        const msg = error?.message?.toLowerCase() ?? "";
        if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
          // Last attempt to reclaim
          user = await findAuthUserByEmail(email);
        }
        if (!user) {
          return {
            status: 400,
            body: { error: error?.message || "Could not create account" },
          };
        }
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password,
          email_confirm: false,
          user_metadata: metadata,
        });
        if (updateError) {
          return { status: 500, body: { error: updateError.message || "Could not update account" } };
        }
      }
    } else {
      user = data.user;
    }
  }

  if (!user) {
    return { status: 500, body: { error: "Could not create account" } };
  }

  try {
    await upsertMembership(user.id, email, role, profile);
  } catch (e) {
    return {
      status: 500,
      body: { error: e instanceof Error ? e.message : "Could not create profile" },
    };
  }

  const sendResult = await handleSend(email, "signup", user.id, { force: true });
  if (sendResult.status >= 400) {
    return sendResult;
  }

  return {
    status: 200,
    body: {
      ok: true,
      userId: user.id,
      email,
      message: "Verification code sent",
    },
  };
}

async function handleVerify(
  emailRaw: string,
  purpose: Purpose,
  codeRaw: string,
  newPassword?: string,
) {
  const email = normalizeEmail(emailRaw);
  const code = String(codeRaw ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { status: 400, body: { error: "Enter the 6-digit code from your email" } };
  }

  const row = await fetchActiveOtp(email, purpose);
  if (!row) return { status: 400, body: { error: "No active code. Request a new one." } };
  if (row.attempts >= 5) return { status: 429, body: { error: "Too many attempts. Request a new code." } };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await consumeOtp(row.id);
    return { status: 400, body: { error: "Code expired. Request a new one." } };
  }
  if (row.code_hash !== hashOtp(code, email, purpose)) {
    await bumpOtpAttempts(row.id, row.attempts);
    return { status: 400, body: { error: "Incorrect code" } };
  }

  await consumeOtp(row.id);

  let user = await findAuthUserByEmail(email);
  if (!user) return { status: 404, body: { error: "Account not found" } };

  const supabase = adminClient();

  if (purpose === "signup") {
    const updates: { email_confirm: boolean; password?: string } = { email_confirm: true };
    const password = (newPassword ?? "").trim();
    if (password.length >= 8) {
      updates.password = password;
    }
    const { error } = await supabase.auth.admin.updateUserById(user.id, updates);
    if (error) return { status: 500, body: { error: error.message || "Could not verify account" } };

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkError || !linkData.properties?.hashed_token) {
      console.warn("[auth-otp] generateLink failed", linkError?.message);
      return { status: 200, body: { ok: true, verified: true, purpose: "signup" } };
    }
    return {
      status: 200,
      body: {
        ok: true,
        verified: true,
        purpose: "signup",
        token_hash: linkData.properties.hashed_token,
      },
    };
  }

  const password = newPassword ?? "";
  if (password.length < 8) {
    return { status: 400, body: { error: "New password must be at least 8 characters" } };
  }
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });
  if (error) return { status: 500, body: { error: error.message || "Could not update password" } };
  return { status: 200, body: { ok: true, verified: true, purpose: "reset" } };
}

export async function handleAuthOtpRequest(request: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: cors });
  }
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  }

  try {
    const body = (await request.json()) as {
      action?: string;
      email?: string;
      purpose?: Purpose;
      code?: string;
      newPassword?: string;
      userId?: string;
      password?: string;
      role?: Role;
      profile?: RegisterProfile;
      force?: boolean;
    };

    if (body.action === "login-help") {
      const result = await handleLoginHelp(body.email ?? "", body.role);
      return Response.json(result.body, { status: result.status, headers: cors });
    }
    if (body.action === "register") {
      const result = await handleRegister({
        email: body.email,
        password: body.password,
        role: body.role,
        profile: body.profile,
      });
      return Response.json(result.body, { status: result.status, headers: cors });
    }
    if (body.action === "send") {
      const result = await handleSend(body.email ?? "", body.purpose as Purpose, body.userId, {
        force: !!body.force,
      });
      return Response.json(result.body, { status: result.status, headers: cors });
    }
    if (body.action === "verify") {
      const result = await handleVerify(
        body.email ?? "",
        body.purpose as Purpose,
        body.code ?? "",
        body.newPassword,
      );
      return Response.json(result.body, { status: result.status, headers: cors });
    }
    return Response.json({ error: "Unknown action" }, { status: 400, headers: cors });
  } catch (e) {
    console.error("[auth-otp]", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500, headers: cors },
    );
  }
}
