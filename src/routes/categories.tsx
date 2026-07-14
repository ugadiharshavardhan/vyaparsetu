import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout shell for /categories and /categories/$slug
export const Route = createFileRoute("/categories")({
  component: () => <Outlet />,
});
