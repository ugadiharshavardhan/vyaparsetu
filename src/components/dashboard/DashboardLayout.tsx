import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";
import { useRouterState } from "@tanstack/react-router";
import { useAccountFlags } from "@/hooks/useAccountFlags";
import { useSessionMode } from "@/hooks/useSessionMode";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { data: account } = useAccountFlags();
  const sessionMode = useSessionMode();

  const isAdminRoute = pathname.startsWith("/admin");
  const showAdminNav = isAdminRoute && !!account?.isAdmin;
  const isSupplier =
    !showAdminNav &&
    (sessionMode === "seller" || (sessionMode !== "buyer" && !!account?.isSeller));
  const isBuyerLayout = !showAdminNav && !isSupplier;

  if (isBuyerLayout) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <DashboardTopbar isBuyerLayout={true} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 w-full"
        >
          {children}
        </motion.main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar isBuyerLayout={false} />
          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            {children}
          </motion.main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

