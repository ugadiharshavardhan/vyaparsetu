import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout shell for /orders (list) and /orders/$id (detail).
// Without this Outlet, visiting /orders/$id rendered the parent list and never
// showed the detail page.
export const Route = createFileRoute("/_authenticated/orders")({
  component: () => <Outlet />,
});
