import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — VyaparSetu" },
      { name: "description", content: "Sign in or create your VyaparSetu wholesale account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    navigate({ to: "/auth", search: { mode: m, redirect: search.redirect } });
  };

  return (
    <AuthLayout
      eyebrow={mode === "signin" ? "Welcome back" : "Get started"}
      title={mode === "signin" ? "Sign in to VyaparSetu" : "Create your business account"}
      subtitle={
        mode === "signin"
          ? "Access your orders, credit line and supplier network."
          : "Join 84,000+ Indian retailers sourcing at wholesale prices."
      }
    >
      <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1 shadow-soft">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              mode === m
                ? "bg-brand text-white shadow-brand"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      {mode === "signin" ? <SignInForm /> : <SignUpForm />}

      <p className="mt-6 text-sm text-muted-foreground">
        {mode === "signin" ? "New to VyaparSetu? " : "Already have an account? "}
        <button
          onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
          className="font-semibold text-brand hover:underline"
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </AuthLayout>
  );
}
