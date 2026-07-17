import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

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
    /* no local .env — rely on host secrets */
  }
}

function env(name: string, fallback = "") {
  bootstrapEnv();
  return (process.env[name] ?? fallback).trim();
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

function credentials() {
  const keyId = env("RAZORPAY_KEY_ID");
  const keySecret = env("RAZORPAY_KEY_SECRET");
  return { keyId, keySecret };
}

async function createRazorpayOrder(input: {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}) {
  const { keyId, keySecret } = credentials();
  if (!keyId || !keySecret) {
    return json({ error: "Razorpay keys are not configured on the server." }, 500);
  }

  // Razorpay expects the amount in the smallest currency unit (paise for INR).
  const amountPaise = Math.round(input.amount * 100);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    return json({ error: "Invalid order amount" }, 400);
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: input.currency ?? "INR",
      receipt: input.receipt ?? `rcpt_${Date.now()}`,
      notes: input.notes ?? {},
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      (data?.error as { description?: string } | undefined)?.description ??
      "Could not create Razorpay order";
    return json({ error: message }, res.status);
  }

  return json({
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId,
  });
}

function verifySignature(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const { keySecret } = credentials();
  if (!keySecret) {
    return json({ error: "Razorpay keys are not configured on the server." }, 500);
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return json({ error: "Missing payment verification fields" }, 400);
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const valid = expected === razorpay_signature;
  return json({ valid });
}

export async function handleRazorpayRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type, authorization, apikey",
      },
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = String(body.action ?? "");
  try {
    if (action === "create-order") {
      return await createRazorpayOrder({
        amount: Number(body.amount),
        currency: body.currency ? String(body.currency) : undefined,
        receipt: body.receipt ? String(body.receipt) : undefined,
        notes: (body.notes as Record<string, string>) ?? {},
      });
    }
    if (action === "verify") {
      return verifySignature({
        razorpay_order_id: String(body.razorpay_order_id ?? ""),
        razorpay_payment_id: String(body.razorpay_payment_id ?? ""),
        razorpay_signature: String(body.razorpay_signature ?? ""),
      });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
}
