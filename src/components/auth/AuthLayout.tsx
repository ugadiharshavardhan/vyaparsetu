import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowLeft, ShoppingBasket, ShieldCheck, Truck, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

const AUTH_LOGO = "/logo1.png";

/** Shared field styles for auth forms (sign-in / sign-up). */
export const authFieldLabel =
  "text-sm font-semibold text-[#1a1a1a]";
export const authInputWithIcon =
  "h-12 rounded-lg border-[#E0E0E0] bg-white pl-10 pr-3 text-sm shadow-none placeholder:text-[#B0B0B0] focus-visible:border-brand/40 focus-visible:ring-brand/20";
export const authSubmitButton =
  "h-12 w-full rounded-lg bg-[#108548] text-sm font-semibold text-white shadow-none hover:bg-[#0d7340]";

const FEATURES = [
  {
    icon: ShoppingBasket,
    title: "Wide Range of Products",
    description: "Everything your store needs, in one place.",
  },
  {
    icon: Truck,
    title: "Reliable Logistics",
    description: "On-time delivery, every time.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Safe, fast & hassle-free transactions.",
  },
] as const;

function DotGrid({
  rows,
  cols,
  className,
}: {
  rows: number;
  cols: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("grid gap-[7px]", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, 6px)` }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <span key={i} className="block h-[6px] w-[6px] rounded-full bg-[#C8C8C8]" />
      ))}
    </div>
  );
}

function AuthDecorations() {
  return (
    <>
      {/* Soft green blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-[#D9EBE1]/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-[#D9EBE1]/60 blur-3xl"
      />

      {/* Outlined circle — top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[12%] top-[8%] hidden h-[72px] w-[72px] rounded-full border-2 border-[#108548]/25 lg:block"
      />

      {/* Dot grids */}
      <DotGrid rows={4} cols={5} className="absolute left-[6%] top-[10%] hidden sm:grid" />
      <DotGrid rows={4} cols={5} className="absolute bottom-[12%] right-[6%] hidden sm:grid" />
    </>
  );
}

function AuthBrandLogo({ size = "lg" }: { size?: "lg" | "sm" }) {
  const dim = size === "lg" ? "h-[120px] w-[120px] sm:h-[128px] sm:w-[128px]" : "h-16 w-16";

  return (
    <div className={cn("mx-auto flex shrink-0 items-center justify-center", dim)}>
      <img
        src={AUTH_LOGO}
        alt={SITE.name}
        decoding="async"
        className="block h-full w-full object-contain object-center"
      />
    </div>
  );
}

function AuthMarketingPanel() {
  return (
    <div className="hidden w-full max-w-[520px] flex-1 flex-col items-center justify-center lg:flex">
      <div className="flex w-full max-w-[480px] flex-col items-center text-center">
        <AuthBrandLogo size="lg" />

        <h2 className="mt-8 font-display text-[2rem] font-semibold leading-snug tracking-tight text-[#2d2d2d] xl:text-[2.15rem]">
          Join <span className="text-[#108548]">{SITE.name}</span> and simplify,
          manage your business, and grow{" "}
          <span className="text-[#108548]">every day.</span>
        </h2>

        <div className="mx-auto mt-5 h-[3px] w-10 rounded-full bg-[#108548]" />

        <p className="mt-4 text-base text-[#757575]">One platform. Endless possibilities.</p>
      </div>

      <div className="mt-14 grid w-full grid-cols-3 gap-0 border-t border-[#E8E8E8] pt-10">
        {FEATURES.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className={cn(
              "flex flex-col items-center px-3 text-center",
              index > 0 && "border-l border-[#E8E8E8]",
            )}
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#D9EBE1] bg-[#EEF6F1]">
              <Icon className="h-5 w-5 text-[#108548]" strokeWidth={2} />
            </div>
            <p className="mt-3 text-xs font-semibold leading-snug text-[#1a1a1a]">{title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#757575]">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthLayout({
  children,
  title,
  subtitle,
  eyebrow,
  icon = "user",
  headerSlot,
  footerSlot,
  className,
  wideCard,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: "user" | "lock" | "none";
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  className?: string;
  /** Wider card for multi-field sign-up forms */
  wideCard?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-x-hidden bg-[#F9FBF9]",
        className,
      )}
    >
      <AuthDecorations />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-4 py-10 sm:px-6 lg:gap-12 lg:px-8 xl:gap-20">
        <AuthMarketingPanel />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={cn(
            "w-full shrink-0 rounded-2xl bg-white px-7 py-9 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] sm:px-9 sm:py-10",
            wideCard ? "max-w-[520px]" : "max-w-[440px]",
            wideCard && "max-h-[90vh] overflow-y-auto",
          )}
        >
          {/* Back to landing page */}
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#757575] transition-colors hover:text-[#108548]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Mobile brand logo */}
          <div className="mb-6 flex justify-center lg:hidden">
            <AuthBrandLogo size="sm" />
          </div>

          {headerSlot ? <div className="mb-5">{headerSlot}</div> : null}

          {icon !== "none" && (
            <div className="mb-5 flex justify-center">
              <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#108548]/30 bg-[#EEF6F1]">
                <User className="h-6 w-6 text-[#108548]" strokeWidth={2} />
              </div>
            </div>
          )}

          {eyebrow ? (
            <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#108548]">
              {eyebrow}
            </p>
          ) : null}

          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#1a1a1a] sm:text-[1.65rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-[#757575]">{subtitle}</p>
            ) : null}
          </div>

          <div className="mt-7">{children}</div>
          {footerSlot ? <div className="mt-6">{footerSlot}</div> : null}
        </motion.div>
      </div>
    </div>
  );
}
