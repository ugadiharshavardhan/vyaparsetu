import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { clearSessionMode } from "@/lib/sessionMode";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "https://hackathonchatbot.vercel.app";

/**
 * A reusable API client for communicating with the FastAPI backend.
 * Every authenticated request automatically includes the Supabase JWT.
 */
export async function apiClient(path: string, options: RequestInit = {}) {
  // Retrieve the latest access token from the active Supabase session
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set Content-Type default for requests that send bodies
  if (!headers.has("Content-Type") && (options.method === "POST" || options.method === "PUT" || options.method === "PATCH")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${BACKEND_API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      console.warn("Authentication error: clearing session and redirecting.");
      await supabase.auth.signOut();
      clearSessionMode();
      if (typeof window !== "undefined") {
        toast.error("Session expired or unauthorized. Please log in again.");
        window.location.href = "/auth?mode=signin&role=buyer";
      }
      throw new Error(`Auth Error ${response.status}`);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "Unknown error");
      throw new Error(`HTTP Error ${response.status}: ${text}`);
    }

    return response;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}
