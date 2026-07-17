import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve the current session robustly. Right after a client navigation the
 * Supabase client may still be (re)initializing / rotating its token, so a
 * single `getSession()` can transiently return null for a genuinely
 * signed-in user. Retry a couple of times, then fall back to `getUser()`
 * (which revalidates against the server) before treating them as a guest.
 */
export async function resolveAuthedUser() {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return data.session.user;
    if (attempt < 2) await new Promise((r) => setTimeout(r, 120));
  }
  const { data: userData } = await supabase.auth.getUser();
  return userData.user ?? null;
}
