import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout shell for /supplier/orders (list) and /supplier/orders/$id (detail).
// Without this Outlet, visiting /supplier/orders/$id rendered the parent list
// and never showed the detail page (same issue fixed for buyer /orders).
export const Route = createFileRoute("/_authenticated/supplier/orders")({
  component: () => <Outlet />,
});
