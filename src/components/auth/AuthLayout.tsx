import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

export function AuthLayout({
  children,
  title,
  subtitle,
  eyebrow,
  icon = "lock",
  headerSlot,
  footerSlot,
  className,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  /** Optional small label above the title (admin, cart pending, etc.) */
  eyebrow?: string;
  icon?: "lock" | "none";
  /** Rendered above the heading (e.g. Buyer / Seller toggle). */
  headerSlot?: ReactNode;
  /** Rendered below the form (e.g. create-account link). */
  footerSlot?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4 py-8 sm:px-6 sm:py-12",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_20px_60px_-24px_rgba(0,0,0,0.18)] lg:grid-cols-2"
      >
        {/* Left — brand logo panel */}
        <div className="relative hidden items-center justify-center bg-[#eceef1] lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_55%)]"
          />
          <div className="relative flex flex-col items-center gap-5 px-10 py-16 text-center">
            <div className="rounded-full bg-white p-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)] ring-1 ring-black/5">
              <img
                src={SITE.logo}
                alt={SITE.name}
                className="h-28 w-28 object-contain sm:h-32 sm:w-32"
              />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-foreground">
                {SITE.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{SITE.tagline}</p>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo className="scale-110" />
          </div>

          {headerSlot ? <div className="mb-6">{headerSlot}</div> : null}

          {icon === "lock" && (
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border-2 border-brand text-brand">
              <Lock className="h-4 w-4" strokeWidth={2.25} />
            </div>
          )}

          {eyebrow ? (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}

          <div className="mt-7">{children}</div>
          {footerSlot ? <div className="mt-7">{footerSlot}</div> : null}
        </div>
      </motion.div>
    </div>
  );
}
