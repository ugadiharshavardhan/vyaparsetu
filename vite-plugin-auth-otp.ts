import type { Plugin } from "vite";
import { loadEnv } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Ensures /api/auth-otp works in Vite SSR/dev without Supabase Edge Functions. */
export function authOtpApiPlugin(): Plugin {
  return {
    name: "auth-otp-api",
    configureServer(server) {
      // Load SMTP_* / SUPABASE_* into process.env (Vite only exposes VITE_* to the client).
      const loaded = loadEnv(server.config.mode, server.config.envDir ?? process.cwd(), "");
      for (const [key, value] of Object.entries(loaded)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (url !== "/api/auth-otp") {
          next();
          return;
        }
        try {
          await handle(req, res);
        } catch (e) {
          console.error("[auth-otp-api]", e);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : "Unexpected error" }));
          }
        }
      });
    },
  };
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const { handleAuthOtpRequest } = await import("./src/server/authOtpHandler");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, apikey");
    res.end("ok");
    return;
  }

  const raw = req.method === "POST" ? await readBody(req) : "";
  const request = new Request("http://localhost/api/auth-otp", {
    method: req.method ?? "GET",
    headers: { "Content-Type": req.headers["content-type"] ?? "application/json" },
    body: req.method === "POST" ? raw : undefined,
  });

  const response = await handleAuthOtpRequest(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.end(await response.text());
}
