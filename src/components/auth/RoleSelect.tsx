import { motion } from "framer-motion";
import {
  ArrowRight, Boxes, ClipboardList, Factory, PackageCheck,
  ShoppingBag, Store, TrendingUp, Truck, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type BusinessRole = "buyer" | "seller";

const OPTIONS: {
  role: BusinessRole;
  title: string;
  subtitle: string;
  icon: typeof ShoppingBag;
  features: { icon: typeof Boxes; label: string }[];
}[] = [
  {
    role: "buyer",
    title: "Source Products",
    subtitle: "Purchase wholesale products directly from verified manufacturers.",
    icon: ShoppingBag,
    features: [
      { icon: Store, label: "Browse marketplace" },
      { icon: Boxes, label: "Bulk orders" },
      { icon: Truck, label: "Order tracking" },
      { icon: TrendingUp, label: "Wholesale pricing" },
    ],
  },
  {
    role: "seller",
    title: "Sell Products",
    subtitle: "Sell products directly to retailers and manage your business.",
    icon: Factory,
    features: [
      { icon: PackageCheck, label: "Product management" },
      { icon: ClipboardList, label: "Inventory & orders" },
      { icon: Truck, label: "Dispatch" },
      { icon: Wallet, label: "Payments" },
    ],
  },
];

export function RoleSelect({
  value,
  onChange,
  onContinue,
}: {
  value: BusinessRole | null;
  onChange: (role: BusinessRole) => void;
  onContinue: (role: BusinessRole) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome to VyaparSetu
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select your business profile to continue
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt, i) => {
          const Icon = opt.icon;
          const selected = value === opt.role;
          return (
            <motion.button
              key={opt.role}
              type="button"
              onClick={() => onChange(opt.role)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-soft transition-all",
                selected
                  ? "border-brand bg-brand-soft/40 ring-2 ring-brand/30 shadow-brand"
                  : "border-border hover:border-brand/40 hover:shadow-elevated",
              )}
              aria-pressed={selected}
            >
              <div
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-xl transition-colors",
                  selected ? "gradient-brand text-white" : "bg-brand-soft text-brand group-hover:gradient-brand group-hover:text-white",
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{opt.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{opt.subtitle}</p>

              <ul className="mt-4 grid grid-cols-2 gap-2">
                {opt.features.map((f) => {
                  const FIcon = f.icon;
                  return (
                    <li key={f.label} className="flex items-center gap-1.5 text-xs text-foreground/80">
                      <FIcon className="h-3.5 w-3.5 text-brand" />
                      {f.label}
                    </li>
                  );
                })}
              </ul>

              <div
                className={cn(
                  "mt-4 inline-flex items-center gap-1 text-xs font-semibold transition-colors",
                  selected ? "text-brand" : "text-muted-foreground group-hover:text-brand",
                )}
              >
                {selected ? "Selected" : "Choose this"}
              </div>
            </motion.button>
          );
        })}
      </div>

      <Button
        size="lg"
        disabled={!value}
        onClick={() => value && onContinue(value)}
        className="w-full shadow-brand"
      >
        Continue <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}
