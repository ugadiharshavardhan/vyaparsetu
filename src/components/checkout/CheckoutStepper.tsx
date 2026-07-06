import { Check } from "lucide-react";

export type CheckoutStep = { key: string; label: string };

export function CheckoutStepper({
  steps,
  current,
}: {
  steps: CheckoutStep[];
  current: number;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition ${
                  done
                    ? "bg-emerald-600 text-white"
                    : active
                      ? "bg-brand text-white shadow-brand"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="hidden sm:block">
                <div className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="h-0.5 flex-1 rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
