import { useEffect, useState } from "react";
import { getSessionMode, type SessionMode } from "@/lib/sessionMode";

export function useSessionMode(): SessionMode | null {
  const [mode, setMode] = useState<SessionMode | null>(null);
  useEffect(() => {
    setMode(getSessionMode());
    const sync = () => setMode(getSessionMode());
    window.addEventListener("vs:session-mode", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("vs:session-mode", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return mode;
}
