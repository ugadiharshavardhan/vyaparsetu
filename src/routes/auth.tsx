import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { RoleSelect, type BusinessRole } from "@/components/auth/RoleSelect";
import { resolvePostLoginPath } from "@/lib/postLoginRedirect";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const path = await resolvePostLoginPath(data.session.user.id);
      throw redirect({ to: path });
    }
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
  const [role, setRole] = useState<BusinessRole | null>(null);
  const [step, setStep] = useState<"role" | "form">("role");

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    setStep("role");
    setRole(null);
    navigate({ to: "/auth", search: { mode: m, redirect: search.redirect } });
  };

  const isRoleStep = step === "role";

  return (
    <AuthLayout
      eyebrow={mode === "signin" ? "Welcome back" : "Get started"}
      title={
        isRoleStep
          ? mode === "signin"
            ? "How would you like to sign in?"
            : "How will you use VyaparSetu?"
          : mode === "signin"
            ? "Sign in to VyaparSetu"
            : "Create your business account"
      }
      subtitle={
        isRoleStep
          ? "Choose Customer or Seller — each account type is stored separately."
          : mode === "signin"
            ? "Sign in with the same account type you registered as."
            : "Join 84,000+ Indian businesses trading on VyaparSetu."
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

      {isRoleStep && (
        <RoleSelect
          value={role}
          onChange={setRole}
          onContinue={(r) => {
            setRole(r);
            setStep("form");
          }}
        />
      )}
      {!isRoleStep && mode === "signin" && role && (
        <SignInForm role={role} onBack={() => setStep("role")} />
      )}
      {!isRoleStep && mode === "signup" && role && (
        <SignUpForm role={role} onBack={() => setStep("role")} />
      )}

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
