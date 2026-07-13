// Tracks which workspace mode the user chose at sign-in (Customer vs Seller).
// This overrides DB-role-based sidebar selection so a user with both buyer
// and seller roles sees the workspace they actually asked for this session.

const KEY = "vs.session.mode";
export type SessionMode = "buyer" | "seller";

export function setSessionMode(mode: SessionMode) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, mode); } catch { /* ignore */ }
  window.dispatchEvent(new Event("vs:session-mode"));
}

export function getSessionMode(): SessionMode | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "buyer" || v === "seller" ? v : null;
  } catch {
    return null;
  }
}

export function clearSessionMode() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event("vs:session-mode"));
}
