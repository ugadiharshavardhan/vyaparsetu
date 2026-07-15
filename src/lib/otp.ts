import { supabase } from "@/integrations/supabase/client";

export type OtpPurpose = "signup" | "reset";

type OtpResponse = {
  ok?: boolean;
  verified?: boolean;
  purpose?: OtpPurpose;
  message?: string;
  error?: string;
  expiresInSec?: number;
  userId?: string;
  email?: string;
  token_hash?: string;
};

async function invokeOtp(body: Record<string, unknown>): Promise<OtpResponse> {
  const res = await fetch("/api/auth-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: OtpResponse = {};
  try {
    data = (await res.json()) as OtpResponse;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  if (data.error) throw new Error(data.error);
  return data;
}

export async function registerWithOtp(input: {
  email: string;
  password: string;
  role: "buyer" | "seller";
  profile: {
    full_name?: string;
    business_name?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    gst_number?: string;
  };
}) {
  return invokeOtp({
    action: "register",
    email: input.email,
    password: input.password,
    role: input.role,
    profile: input.profile,
  });
}

export async function sendEmailOtp(
  email: string,
  purpose: OtpPurpose,
  options?: { userId?: string; force?: boolean },
) {
  return invokeOtp({
    action: "send",
    email,
    purpose,
    userId: options?.userId,
    force: options?.force,
  });
}

export async function verifyEmailOtp(input: {
  email: string;
  purpose: OtpPurpose;
  code: string;
  newPassword?: string;
}) {
  return invokeOtp({
    action: "verify",
    email: input.email,
    purpose: input.purpose,
    code: input.code,
    newPassword: input.newPassword,
  });
}

/** Open a Supabase session after signup OTP — prefers token_hash, else password. */
export async function establishSessionAfterSignup(input: {
  email: string;
  password: string;
  tokenHash?: string;
}): Promise<{ userId: string }> {
  if (input.tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: input.tokenHash,
      type: "email",
    });
    if (!error && data.user) {
      return { userId: data.user.id };
    }
  }

  let lastMessage = "Could not sign in after verification";
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (!error && data.user) {
      return { userId: data.user.id };
    }
    lastMessage = error?.message || lastMessage;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(
    lastMessage.toLowerCase().includes("invalid")
      ? "Email verified, but sign-in failed. Use Sign in with the same password."
      : lastMessage,
  );
}
