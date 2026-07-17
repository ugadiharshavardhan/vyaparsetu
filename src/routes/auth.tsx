import { createFileRoute, isRedirect, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthRoleToggle } from "@/components/auth/AuthRoleToggle";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { AdminSignInForm } from "@/components/auth/AdminSignInForm";
import type { BusinessRole } from "@/components/auth/RoleSelect";
import { resolvePostLoginPath, sanitizeReturnPath, isSellerWorkspacePath } from "@/lib/postLoginRedirect";
import { getSessionMode } from "@/lib/sessionMode";
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
  ssr: false,
  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    try {
      const user = await resolveAuthedUser();
      if (!user) return;

      const pendingReturn = sanitizeReturnPath(peekPendingCartAdd()?.returnTo);
      let dest = sanitizeReturnPath(search.redirect) || pendingReturn;

      // A seller-mode session always lands in the seller workspace: drop any
      // stale buyer-side destination (cart/marketplace/product URLs) so the
      // resolver below sends them to /seller/dashboard.
      if (getSessionMode() === "seller" && dest && !isSellerWorkspacePath(dest)) {
        dest = null;
      }

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
    } catch (e) {
      // Only intentional redirects should propagate. Any unexpected failure
      // (network hiccup, RPC/role lookup error, token revalidation) must NOT
      // bubble to the global "Something went wrong" boundary — just render the
      // auth page so the user can sign in.
      if (isRedirect(e)) throw e;
      return;
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
  const mode = search.mode ?? "signin";
  const adminLogin = isAdminRedirect(search.redirect);
  const role: BusinessRole = adminLogin ? "buyer" : (search.role ?? "buyer");
  const pendingCart = peekPendingCartAdd();
  // "Add to cart" is a buyer-only intent — only surface that messaging on the
  // Buyer tab. The role toggle stays fully interactive so a stale pending item
  // can never grey it out / lock it.
  const pendingProduct = !!pendingCart && !adminLogin && role === "buyer";

  const setRoleAndUrl = (next: BusinessRole) => {
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
      search: { mode: m, role, redirect: search.redirect },
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
