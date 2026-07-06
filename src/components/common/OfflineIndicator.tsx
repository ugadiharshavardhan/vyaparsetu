import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Fixed-position banner shown when the browser goes offline.
 * Rendered globally via SiteLayout / root shell.
 */
export function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 bottom-4 z-[100] mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-foreground/95 px-4 py-2 text-xs font-medium text-background shadow-lg backdrop-blur"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>You're offline — some features are unavailable</span>
    </div>
  );
}
