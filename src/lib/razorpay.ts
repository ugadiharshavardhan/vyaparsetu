const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<boolean> | null = null;

export type RazorpayOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (payload: RazorpayFailure) => void) => void;
    };
  }
}

export type RazorpayFailure = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    source?: string;
    step?: string;
  };
};

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

async function postRazorpay<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/razorpay", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok || (data as { error?: string }).error) {
    throw new Error((data as { error?: string }).error ?? "Razorpay request failed");
  }
  return data;
}

export function createRazorpayOrder(input: {
  amount: number;
  receipt?: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  return postRazorpay<RazorpayOrder>({ action: "create-order", ...input });
}

export function verifyRazorpayPayment(input: RazorpaySuccess): Promise<{ valid: boolean }> {
  return postRazorpay<{ valid: boolean }>({ action: "verify", ...input });
}

export type OpenCheckoutInput = {
  order: RazorpayOrder;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
};

/** Opens the Razorpay modal and resolves with the success payload (or null if dismissed). */
export async function openRazorpayCheckout(
  input: OpenCheckoutInput,
): Promise<RazorpaySuccess | null> {
  const ready = await loadRazorpayScript();
  if (!ready || !window.Razorpay) {
    throw new Error("Could not load Razorpay. Check your connection and try again.");
  }

  return new Promise<RazorpaySuccess | null>((resolve, reject) => {
    let settled = false;
    const rzp = new window.Razorpay!({
      key: input.order.keyId,
      amount: input.order.amount,
      currency: input.order.currency,
      name: "VyaparSetu",
      description: input.description ?? "B2B wholesale order",
      order_id: input.order.orderId,
      prefill: input.prefill,
      notes: input.notes,
      theme: { color: "#1f8f4e" },
      handler: (response) => {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (!settled) resolve(null);
        },
      },
    });

    // Surface gateway-side failures (e.g. Pay Later declines, expired VPA, bank timeouts)
    // instead of leaving the user stuck on the modal with no feedback.
    rzp.on("payment.failed", (payload: RazorpayFailure) => {
      if (settled) return;
      settled = true;
      const description =
        payload?.error?.description ||
        payload?.error?.reason ||
        "Payment failed or was declined. Please try another method.";
      reject(new Error(description));
    });

    try {
      rzp.open();
    } catch (e) {
      reject(e instanceof Error ? e : new Error("Could not open Razorpay checkout"));
    }
  });
}
