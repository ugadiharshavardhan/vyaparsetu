import { Link } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { UserMenu } from "@/components/layout/UserMenu";
import { CartButton } from "@/components/cart/CartButton";
import { DEMO_NOTIFICATIONS } from "@/data/dashboard";


export function DashboardTopbar() {
  const unread = DEMO_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger />

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products, orders, suppliers…" className="h-9 w-72 pl-9" />
        </div>

        <CartButton variant="ghost" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <div className="font-semibold">Notifications</div>
                <div className="text-xs text-muted-foreground">{unread} unread</div>
              </div>
              <Button asChild variant="ghost" size="sm"><Link to="/notifications">See all</Link></Button>
            </div>
            <ul className="max-h-80 divide-y overflow-y-auto">
              {DEMO_NOTIFICATIONS.slice(0, 4).map((n) => (
                <li key={n.id} className="flex gap-3 p-3 hover:bg-muted/50">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <n.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{n.title}</div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{n.time}</div>
                  </div>
                  {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <UserMenu />
      </div>
    </header>
  );
}
