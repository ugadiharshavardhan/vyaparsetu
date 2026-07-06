import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      <div className="container-page space-y-8 py-8">{children}</div>
    </DashboardLayout>
  );
}
