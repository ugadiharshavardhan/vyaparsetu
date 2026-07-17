const STORAGE_KEY = "vs.browse-scroll.v1";

/** Stable key for the current browse view (path + search params). */
export function browseScrollKey(pathname: string, search: Record<string, unknown> = {}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value == null || value === "") continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Remember list scroll before opening a product detail page. */
export function saveBrowseScroll(key: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ key, y: window.scrollY }),
    );
  } catch {
    /* ignore quota */
  }
}

/** Restore list scroll once when returning from a product page. */
export function consumeBrowseScroll(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { key?: string; y?: number };
    sessionStorage.removeItem(STORAGE_KEY);
    if (parsed.key !== key || typeof parsed.y !== "number") return null;
    return parsed.y;
  } catch {
    return null;
  }
}

export function restoreBrowseScroll(key: string) {
  const y = consumeBrowseScroll(key);
  if (y == null) return;
  requestAnimationFrame(() => {
    window.scrollTo({ top: y, left: 0, behavior: "auto" });
  });
}
