import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Purpose = "signup" | "reset";

type SendBody = {
  action: "send";
  email: string;
  purpose: Purpose;
};

type VerifyBody = {
  action: "verify";
  email: string;
  purpose: Purpose;
  code: string;
  /** Required when purpose === "reset" */
  newPassword?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

async function hashOtp(code: string, email: string, purpose: Purpose, secret: string) {
  const payload = `${normalizeEmail(email)}:${purpose}:${code}:${secret}`;
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) throw new Error("Server misconfigured: missing Supabase service credentials");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function findAuthUserByEmail(
  supabase: ReturnType<typeof adminClient>,
  email: string,
) {
  const normalized = normalizeEmail(email);
  const [buyer, seller] = await Promise.all([
    supabase.from("buyers").select("id").eq("email", normalized).maybeSingle(),
    supabase.from("sellers").select("id").eq("email", normalized).maybeSingle(),
  ]);
  const userId = buyer.data?.id ?? seller.data?.id ?? null;
  if (userId) {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (!error && data?.user) return data.user;
  }

  // Fallback: Admin API email filter
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const res = await fetch(`${url}/auth/v1/admin/users?email=${encodeURIComponent(normalized)}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
  });
  if (!res.ok) return null;
  const payload = await res.json();
  const users = (payload?.users ?? payload?.user ? [payload.user] : []) as Array<{
    id: string;
    email?: string;
    email_confirmed_at?: string | null;
  }>;
  return users.find((u) => (u.email ?? "").toLowerCase() === normalized) ?? null;
}

async function sendSmtpEmail(to: string, subject: string, html: string, text: string) {
  const host = Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com";
  const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
  const user = Deno.env.get("SMTP_USER") ?? "";
  const pass = (Deno.env.get("SMTP_PASS") ?? "").replace(/\s+/g, "");
  const from = Deno.env.get("EMAIL_FROM") ?? user;

  if (!user || !pass) {
    throw new Error("Server misconfigured: SMTP_USER / SMTP_PASS (Gmail app password) not set");
  }

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port,
      tls: true,
      auth: {
        username: user,
        password: pass,
      },
    },
  });

  try {
    await client.send({
      from,
      to,
      subject,
      content: text,
      html,
    });
  } catch (e) {
    console.error("[smtp]", e);
    throw new Error(
      "Could not send email via Gmail SMTP. Check SMTP_USER, SMTP_PASS (app password), and that less-secure app passwords are enabled.",
    );
  } finally {
    try {
      await client.close();
    } catch {
      /* ignore */
    }
  }
}

function otpEmail(purpose: Purpose, code: string) {
  const title = purpose === "signup" ? "Verify your VyaparSetu account" : "Reset your VyaparSetu password";
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

async function handleSend(body: SendBody) {
  const email = normalizeEmail(body.email ?? "");
  const purpose = body.purpose;
  if (!email || !email.includes("@")) return json({ error: "Valid email is required" }, 400);
  if (purpose !== "signup" && purpose !== "reset") return json({ error: "Invalid purpose" }, 400);

  const secret = Deno.env.get("OTP_HASH_SECRET") ?? "";
  if (!secret) return json({ error: "Server misconfigured: OTP_HASH_SECRET missing" }, 500);

  const supabase = adminClient();

  const user = await findAuthUserByEmail(supabase, email);

  // For reset: always look like success (no email enumeration)
  if (purpose === "reset" && !user) {
    return json({ ok: true, message: "If an account exists, a code was sent." });
  }

  if (purpose === "signup" && !user) {
    return json({ error: "Create your account first, then verify the code." }, 400);
  }

  const { data: recent } = await supabase
    .from("email_otps")
    .select("created_at")
    .eq("email", email)
    .eq("purpose", purpose)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent?.created_at) {
    const ageMs = Date.now() - new Date(recent.created_at).getTime();
    if (ageMs < 60_000) {
      return json({ error: "Please wait 60 seconds before requesting another code." }, 429);
    }
  }

  const code = generateOtp();
  const code_hash = await hashOtp(code, email, purpose, secret);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Invalidate previous unused codes for this email/purpose
  await supabase
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("email", email)
    .eq("purpose", purpose)
    .is("consumed_at", null);

  const { error: insertError } = await supabase.from("email_otps").insert({
    email,
    purpose,
    code_hash,
    expires_at,
  });
  if (insertError) {
    console.error("[email_otps insert]", insertError);
    return json({ error: "Could not create verification code" }, 500);
  }

  const mail = otpEmail(purpose, code);
  await sendSmtpEmail(email, mail.subject, mail.html, mail.text);

  return json({ ok: true, message: "Verification code sent", expiresInSec: 600 });
}

async function handleVerify(body: VerifyBody) {
  const email = normalizeEmail(body.email ?? "");
  const purpose = body.purpose;
  const code = String(body.code ?? "").trim();
  if (!email || !/^\d{6}$/.test(code)) return json({ error: "Enter the 6-digit code from your email" }, 400);
  if (purpose !== "signup" && purpose !== "reset") return json({ error: "Invalid purpose" }, 400);

  const secret = Deno.env.get("OTP_HASH_SECRET") ?? "";
  if (!secret) return json({ error: "Server misconfigured: OTP_HASH_SECRET missing" }, 500);

  const supabase = adminClient();
  const code_hash = await hashOtp(code, email, purpose, secret);

  const { data: row, error } = await supabase
    .from("email_otps")
    .select("*")
    .eq("email", email)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) return json({ error: "No active code. Request a new one." }, 400);
  if (row.attempts >= 5) return json({ error: "Too many attempts. Request a new code." }, 429);
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return json({ error: "Code expired. Request a new one." }, 400);
  }
  if (row.code_hash !== code_hash) {
    await supabase.from("email_otps").update({ attempts: row.attempts + 1 }).eq("id", row.id);
    return json({ error: "Incorrect code" }, 400);
  }

  await supabase
    .from("email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  const user = await findAuthUserByEmail(supabase, email);
  if (!user) return json({ error: "Account not found" }, 404);

  if (purpose === "signup") {
    const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (confirmError) {
      console.error("[confirm]", confirmError);
      return json({ error: "Could not verify account" }, 500);
    }
    return json({ ok: true, verified: true, purpose: "signup" });
  }

  // password reset
  const newPassword = body.newPassword ?? "";
  if (newPassword.length < 8) {
    return json({ error: "New password must be at least 8 characters" }, 400);
  }
  const { error: pwError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });
  if (pwError) {
    console.error("[reset]", pwError);
    return json({ error: pwError.message || "Could not update password" }, 500);
  }
  return json({ ok: true, verified: true, purpose: "reset" });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = (await req.json()) as SendBody | VerifyBody;
    if (body?.action === "send") return await handleSend(body);
    if (body?.action === "verify") return await handleVerify(body);
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("[auth-otp]", e);
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
