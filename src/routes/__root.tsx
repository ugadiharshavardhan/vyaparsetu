import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { Chatbot } from "@/components/common/Chatbot";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">404</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-3 text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-brand transition hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred. You can retry or head back home."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-brand"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0F5F4A" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "VyaparSetu" },
      { name: "format-detection", content: "telephone=no" },
      { title: "VyaparSetu — India's B2B Wholesale Marketplace" },
      {
        name: "description",
        content:
          "Source verified wholesale products at factory prices. Connect directly with manufacturers, distributors and suppliers across India.",
      },
      { property: "og:site_name", content: "VyaparSetu" },
      { property: "og:title", content: "VyaparSetu — India's B2B Wholesale Marketplace" },
      {
        property: "og:description",
        content:
          "Source verified wholesale products at factory prices. Bulk pricing, GST invoices and business credit for Indian retailers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VyaparSetu — India's B2B Wholesale Marketplace" },
      {
        name: "twitter:description",
        content: "Verified suppliers. Bulk pricing. GST invoices. Built for Indian retailers.",
      },
      { name: "description", content: "Source verified wholesale products at factory prices. Connect directly with manufacturers, distributors and suppliers across India." },
      { property: "og:description", content: "Source verified wholesale products at factory prices. Connect directly with manufacturers, distributors and suppliers across India." },
      { name: "twitter:description", content: "Source verified wholesale products at factory prices. Connect directly with manufacturers, distributors and suppliers across India." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/855186bf-8b02-45cf-8cb6-05fff2250c63/id-preview-6fdf67bd--5aecf599-0088-4fc8-83fc-b2a3eef2de9c.lovable.app-1783368386386.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/855186bf-8b02-45cf-8cb6-05fff2250c63/id-preview-6fdf67bd--5aecf599-0088-4fc8-83fc-b2a3eef2de9c.lovable.app-1783368386386.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400..800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "VyaparSetu",
          description:
            "India's trusted B2B wholesale marketplace connecting retailers with verified manufacturers, distributors and suppliers.",
          areaServed: "IN",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      // Avoid router.invalidate() on SIGNED_IN — it races the post-login navigation
      // and remounts the tree while layout is switching to the dashboard shell.
      if (event === "SIGNED_OUT") {
        queryClient.clear();
        void router.invalidate();
        return;
      }
      if (event === "USER_UPDATED") {
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
        void queryClient.invalidateQueries({ queryKey: ["account-flags"] });
        void queryClient.invalidateQueries({ queryKey: ["onboarding-complete"] });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteLayout>
          <Outlet />
        </SiteLayout>
        <OfflineIndicator />
        <Toaster richColors position="top-center" />
        <Chatbot />
      </AuthProvider>
    </QueryClientProvider>
  );
}
