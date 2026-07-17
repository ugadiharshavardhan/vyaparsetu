import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { browseScrollKey, restoreBrowseScroll } from "@/lib/browseScroll";

/** Restore marketplace / category list scroll after browser back from a product page. */
export function useBrowseScrollRestore() {
  const scrollKey = useRouterState({
    select: (r) =>
      browseScrollKey(r.location.pathname, r.location.search as Record<string, unknown>),
  });

  useEffect(() => {
    restoreBrowseScroll(scrollKey);
  }, [scrollKey]);
}
