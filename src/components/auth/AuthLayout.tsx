import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export function AuthLayout({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-center px-6 py-12 sm:px-12"
        >
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <Logo />
              <div className="mt-8" />
            </div>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </motion.div>

        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 gradient-brand" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_white,_transparent_55%)] opacity-25" />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <div className="w-max">
              <Logo />
            </div>
            <div className="max-w-md space-y-8">
              <h2 className="font-display text-3xl font-bold leading-tight">
                Wholesale Bharat, delivered directly to your shop.
              </h2>
              <div className="space-y-4 text-white/90">
                {[
                  { icon: ShieldCheck, text: "12,500+ GST-verified suppliers" },
                  { icon: TrendingUp, text: "Save up to 42% vs local markets" },
                  { icon: Sparkles, text: "Interest-free credit up to ₹10L" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
                      <f.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm italic text-white/90">
                  "VyaparSetu saves me ₹18,000 every month, and orders arrive in 2 days flat."
                </p>
                <p className="mt-2 text-xs font-semibold text-white/70">— Rakesh S., Sharma Kirana</p>
              </div>
            </div>
            <p className="text-xs text-white/70">© {new Date().getFullYear()} VyaparSetu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
