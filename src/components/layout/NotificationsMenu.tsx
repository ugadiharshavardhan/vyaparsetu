import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessionMode } from "@/hooks/useSessionMode";
import { DEMO_NOTIFICATIONS } from "@/data/dashboard";
import { useSupplierNotifications } from "@/hooks/useSupplier";

export function NotificationsMenu() {
  const mode = useSessionMode();
  const isSeller = mode === "seller";
  const { notifications: supplierNotifs } = useSupplierNotifications();

  // Pick data source based on active mode
  const rawNotifs = isSeller ? supplierNotifs : DEMO_NOTIFICATIONS;
  
  // Show top 3 recent notifications
  const recent = rawNotifs.slice(0, 3);
  const unreadCount = rawNotifs.filter(n => !n.read).length;

  const allNotifsLink = isSeller ? "/supplier/notifications" : "/notifications";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft transition hover:border-brand/40 hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-brand" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] text-brand">{unreadCount} new</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {recent.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <div className="flex flex-col">
            {recent.map((n, i) => (
              <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 whitespace-normal cursor-pointer" asChild>
                <Link to={allNotifsLink}>
                  <div className="flex items-center gap-2">
                    {/* Render blue dot if unread */}
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />}
                    <span className="font-semibold text-sm">{n.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2 ml-4">
                    {n.description || (n as any).body}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-4 mt-1">
                    {new Date(n.timestamp || (n as any).createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center text-brand font-medium">
          <Link to={allNotifsLink}>View all activity</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
