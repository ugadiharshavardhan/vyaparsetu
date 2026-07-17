import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthRoleToggle } from "@/components/auth/AuthRoleToggle";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AdminSignInForm } from "@/components/auth/AdminSignInForm";
import type { BusinessRole } from "@/components/auth/RoleSelect";
import { resolvePostLoginPath, sanitizeReturnPath } from "@/lib/postLoginRedirect";
import { peekPendingCartAdd } from "@/lib/pendingCart";
import { resolveAuthedUser } from "@/lib/resolveAuthedUser";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  role: z.enum(["buyer", "seller"]).optional(),
  redirect: z.string().optional(),
});

function isAdminRedirect(redirect?: string) {
  return !!redirect && (redirect === "/admin" || redirect.startsWith("/admin/"));
}

/** Pull query params off a sanitized return path for TanStack `redirect({ search })`. */
function parseRedirectSearch(dest: string): Record<string, string> | undefined {
  const query = dest.split("?")[1];
  if (!query) return undefined;
  const search: Record<string, string> = {};
  new URLSearchParams(query).forEach((value, key) => {
    search[key] = value;
  });
  return Object.keys(search).length ? search : undefined;
}

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    const user = await resolveAuthedUser();
    if (!user) return;

    const pendingReturn = sanitizeReturnPath(peekPendingCartAdd()?.returnTo);
    const dest = sanitizeReturnPath(search.redirect) || pendingReturn;

    if (dest && (dest === "/admin" || dest.startsWith("/admin/"))) {
      const { data: isAdmin } = await supabase.rpc("is_admin", {
        _user_id: user.id,
      });
      if (isAdmin) {
        throw redirect({
          to: dest.split("?")[0] as never,
          search: parseRedirectSearch(dest) as never,
        });
      }
      await supabase.auth.signOut();
      return;
    }

    if (dest) {
      const pathname = dest.split("?")[0];
      throw redirect({ to: pathname as never, search: parseRedirectSearch(dest) as never });
    }
    const path = await resolvePostLoginPath(user.id, search.redirect);
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
  const pendingCart = peekPendingCartAdd();
  const pendingProduct = !!pendingCart && !adminLogin;
  const role: BusinessRole = pendingProduct ? "buyer" : (search.role ?? "buyer");

  const setRoleAndUrl = (next: BusinessRole) => {
    if (pendingProduct && next === "seller") return;
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
    navigate({
      to: "/auth",
      search: { mode: m, role: pendingProduct ? "buyer" : role, redirect: search.redirect },
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
