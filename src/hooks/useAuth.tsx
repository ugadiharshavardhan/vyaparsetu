import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearSessionMode } from "@/lib/sessionMode";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: typeof supabase.auth.signInWithPassword;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
};

const unauthenticatedAuthContext: AuthContextValue = {
  session: null,
  user: null,
  accessToken: null,
  loading: false,
  isAuthenticated: false,
  login: async (credentials) => {
    return await supabase.auth.signInWithPassword(credentials);
  },
  logout: async () => {
    clearSessionMode();
    await supabase.auth.signOut();
  },
  signOut: async () => {
    clearSessionMode();
    await supabase.auth.signOut();
  },
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register listener FIRST so we never miss an event
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    // Then hydrate from any persisted session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      loading,
      isAuthenticated: !!session?.user,
      login: async (credentials) => {
        return await supabase.auth.signInWithPassword(credentials);
      },
      logout: async () => {
        clearSessionMode();
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
          window.location.href = "/auth?mode=signin&role=buyer";
        }
      },
      signOut: async () => {
        clearSessionMode();
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
          window.location.href = "/auth?mode=signin&role=buyer";
        }
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? unauthenticatedAuthContext;
}
