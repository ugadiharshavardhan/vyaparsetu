import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthRoleToggle } from "@/components/auth/AuthRoleToggle";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AdminSignInForm } from "@/components/auth/AdminSignInForm";
import type { BusinessRole } from "@/components/auth/RoleSelect";
import { resolvePostLoginPath } from "@/lib/postLoginRedirect";
import { peekPendingCartAdd } from "@/lib/pendingCart";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  role: z.enum(["buyer", "seller"]).optional(),
  redirect: z.string().optional(),
});

function isAdminRedirect(redirect?: string) {
  return !!redirect && (redirect === "/admin" || redirect.startsWith("/admin/"));
}

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const pendingReturn = peekPendingCartAdd()?.returnTo;
    const dest = search.redirect || pendingReturn;

    if (dest && (dest === "/admin" || dest.startsWith("/admin/"))) {
      const { data: isAdmin } = await supabase.rpc("is_admin", {
        _user_id: data.session.user.id,
      });
      if (isAdmin) {
        throw redirect({ href: dest });
      }
      await supabase.auth.signOut();
      return;
    }

    if (dest && dest.startsWith("/")) {
      throw redirect({ href: dest });
    }
    const path = await resolvePostLoginPath(data.session.user.id, search.redirect);
    throw redirect({ href: path });
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
  const mode = search.mode ?? "signin";
  const adminLogin = isAdminRedirect(search.redirect);
  const [role, setRole] = useState<BusinessRole>(search.role ?? "buyer");
  const [pendingProduct, setPendingProduct] = useState(false);

  useEffect(() => {
    if (search.role) setRole(search.role);
  }, [search.role]);

  useEffect(() => {
    const pending = peekPendingCartAdd();
    if (!pending || adminLogin) return;
    setPendingProduct(true);
    setRole("buyer");
  }, [adminLogin]);

  const setRoleAndUrl = (next: BusinessRole) => {
    if (pendingProduct && next === "seller") return;
    setRole(next);
    navigate({
      to: "/auth",
      search: {
        mode,
        role: next,
        redirect: search.redirect,
      },
      replace: true,
    });
  };

  const switchMode = (m: "signin" | "signup") => {
    if (adminLogin) {
      navigate({ to: "/auth", search: { mode: "signin", role: "buyer", redirect: search.redirect } });
      return;
    }
    const pending = peekPendingCartAdd();
    const nextRole = pending ? "buyer" : role;
    if (pending) {
      setPendingProduct(true);
      setRole("buyer");
    }
    navigate({
      to: "/auth",
      search: { mode: m, role: nextRole, redirect: search.redirect },
    });
  };

  if (adminLogin) {
    return (
      <AuthLayout
        eyebrow="Admin access"
        title="Sign in to admin dashboard"
        subtitle="Use the platform admin credentials to manage sellers and verifications."
        footerSlot={
          <p className="text-center text-sm text-[#757575]">
            Not an admin?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/auth", search: { mode: "signin", role: "buyer" } })}
              className="font-semibold text-[#108548] hover:opacity-80"
            >
              Buyer / Seller sign in
            </button>
          </p>
        }
      >
        <AdminSignInForm />
      </AuthLayout>
    );
  }

  const isSignIn = mode === "signin";

  return (
    <AuthLayout
      wideCard={!isSignIn}
      eyebrow={pendingProduct ? "Almost there" : undefined}
      title={
        pendingProduct
          ? isSignIn
            ? "Sign in to add to cart"
            : "Create an account to add to cart"
          : isSignIn
            ? "Welcome Back!"
            : "Create Your Account"
      }
      subtitle={
        pendingProduct
          ? "After you sign in, the item you selected will be added to your cart automatically."
          : isSignIn
            ? "Login to access your VyaparSetu account"
            : role === "seller"
              ? "Register as a verified manufacturer, distributor, or wholesaler."
              : "Sign up to start sourcing wholesale on VyaparSetu."
      }
      headerSlot={
        <AuthRoleToggle
          value={role}
          onChange={setRoleAndUrl}
          disabled={pendingProduct}
        />
      }
      footerSlot={
        <p className="text-center text-sm text-[#757575]">
          {isSignIn ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-semibold text-[#108548] hover:opacity-80"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="font-semibold text-[#108548] hover:opacity-80"
              >
                Login
              </button>
            </>
          )}
        </p>
      }
    >
      {isSignIn ? <SignInForm role={role} /> : <SignUpForm role={role} />}
    </AuthLayout>
  );
}
