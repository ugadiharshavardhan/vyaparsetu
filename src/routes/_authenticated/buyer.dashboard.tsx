import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/buyer/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/marketplace", replace: true });
  },
});
