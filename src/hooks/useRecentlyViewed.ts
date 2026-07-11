import { useCallback, useEffect, useState } from "react";

const KEY = "vs.recently-viewed";
const MAX = 12;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => { setIds(read()); }, []);

  const push = useCallback((id: string) => {
    const next = [id, ...read().filter((x) => x !== id)].slice(0, MAX);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setIds([]);
  }, []);

  return { ids, push, clear };
}
