import { useRouterState } from "@tanstack/react-router";
import {
  ContentPageSkeleton,
  DashboardPageSkeleton,
  DetailPageSkeleton,
  FormPageSkeleton,
  OrderListSkeleton,
  ProductDetailSkeleton,
  ProductGridPageSkeleton,
  TablePageSkeleton,
} from "@/components/common/Skeletons";

type Archetype =
  | "product-grid"
  | "product-detail"
  | "dashboard"
  | "table"
  | "orders-list"
  | "detail"
  | "form"
  | "content";

/**
 * Map a destination pathname to the layout archetype of that page so the route
 * pending skeleton matches the real page shell (not always product cards).
 * Order matters: more specific patterns first.
 */
export function classifyRoute(pathname: string): Archetype {
  const p = pathname.replace(/\/+$/, "") || "/";

  // Product detail (gallery + info)
  if (/^\/products\/.+/.test(p)) return "product-detail";

  // Seller product create / edit → form; the index is a table
  if (/^\/supplier\/products\/.+/.test(p)) return "form";
  if (p === "/supplier/products") return "table";

  // Detail pages (record id after the collection)
  if (/^\/orders\/.+/.test(p)) return "detail";
  if (/^\/supplier\/orders\/.+/.test(p)) return "detail";
  if (/^\/supplier\/customers\/.+/.test(p)) return "detail";

  // Buyer orders list uses tall order cards
  if (p === "/orders") return "orders-list";

  // Catalog / product-grid pages
  if (["/marketplace", "/categories", "/suppliers", "/wishlist"].includes(p)) return "product-grid";
  if (/^\/categories\/.+/.test(p)) return "product-grid";
  if (/^\/suppliers\/.+/.test(p)) return "product-grid";

  // Dashboards, analytics, finance & payments (stat cards + panels)
  if (
    [
      "/seller/dashboard",
      "/admin",
      "/payments",
      "/supplier/payments",
      "/supplier/analytics",
      "/supplier/reports",
      "/admin/finance",
      "/admin/analytics",
      "/admin/reports",
      "/admin/payments",
    ].includes(p)
  ) {
    return "dashboard";
  }

  // Forms (profile, settings, address, checkout, onboarding, auth password flows)
  if (
    [
      "/profile",
      "/supplier/profile",
      "/settings",
      "/supplier/settings",
      "/admin/settings",
      "/addresses",
      "/checkout",
      "/onboarding",
      "/reset-password",
      "/forgot-password",
    ].includes(p)
  ) {
    return "form";
  }

  // Simple content pages
  if (
    [
      "/",
      "/about",
      "/contact",
      "/help",
      "/messages",
      "/notifications",
      "/supplier/notifications",
      "/admin/notifications",
      "/unauthorized",
      "/cart",
      "/auth",
    ].includes(p)
  ) {
    return "content";
  }

  // Remaining admin/seller management screens are list/table layouts
  if (/^\/admin\//.test(p) || /^\/supplier\//.test(p)) return "table";

  return "content";
}

function renderArchetype(kind: Archetype) {
  switch (kind) {
    case "product-grid":
      return <ProductGridPageSkeleton />;
    case "product-detail":
      return <ProductDetailSkeleton />;
    case "dashboard":
      return <DashboardPageSkeleton />;
    case "table":
      return <TablePageSkeleton />;
    case "orders-list":
      return <OrderListSkeleton />;
    case "detail":
      return <DetailPageSkeleton />;
    case "form":
      return <FormPageSkeleton />;
    case "content":
    default:
      return <ContentPageSkeleton />;
  }
}

/**
 * App-wide default route pending component. Renders a skeleton that matches the
 * layout of the page being navigated to, instead of always showing product cards.
 */
export function RoutePending() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <div className="min-h-[50vh]">{renderArchetype(classifyRoute(pathname))}</div>;
}
