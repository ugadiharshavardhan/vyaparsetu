import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout shell for /supplier/customers (list) and /supplier/customers/$id (detail).
// Without this Outlet, visiting /supplier/customers/$id rendered the parent list
// and never showed the buyer detail page (same bug as seller/buyer orders).
export const Route = createFileRoute("/_authenticated/supplier/customers")({
  component: () => <Outlet />,
});
