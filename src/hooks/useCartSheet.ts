import { useCallback, useEffect, useState } from "react";

const listeners = new Set<(open: boolean) => void>();
let openState = false;

export function openCartSheet() {
  openState = true;
  listeners.forEach((l) => l(true));
}

export function closeCartSheet() {
  openState = false;
  listeners.forEach((l) => l(false));
}

export function useCartSheet() {
  const [open, setOpen] = useState(openState);

  useEffect(() => {
    const l = (v: boolean) => setOpen(v);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const set = useCallback((v: boolean) => {
    openState = v;
    listeners.forEach((l) => l(v));
  }, []);

  return {
    open,
    setOpen: set,
    openCart: () => set(true),
    closeCart: () => set(false),
  };
}
